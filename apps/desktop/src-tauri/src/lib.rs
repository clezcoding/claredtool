use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{Emitter, Manager, Url, WebviewUrl, WebviewWindowBuilder};

const KEYCHAIN_SERVICE: &str = "com.clared.app";
const KEYCHAIN_ACCOUNT: &str = "session";
const LOGIN_LABEL: &str = "login";
const TICKET_EVENT: &str = "ticket-received";
const CANCEL_EVENT: &str = "login-cancelled";

fn session_entry() -> Result<keyring::Entry, String> {
    keyring::Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT).map_err(|e| e.to_string())
}

fn is_no_entry(err: &keyring::Error) -> bool {
    matches!(err, keyring::Error::NoEntry)
}

#[tauri::command]
fn keychain_set_session(token: String) -> Result<(), String> {
    session_entry()?
        .set_password(&token)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn keychain_get_session() -> Result<Option<String>, String> {
    match session_entry()?.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(err) if is_no_entry(&err) => Ok(None),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn keychain_delete_session() -> Result<(), String> {
    match session_entry()?.delete_credential() {
        Ok(()) => Ok(()),
        Err(err) if is_no_entry(&err) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

fn env_url(keys: &[&str], fallback: &str) -> String {
    keys.iter()
        .find_map(|key| std::env::var(key).ok().filter(|value| !value.is_empty()))
        .unwrap_or_else(|| fallback.to_string())
}

fn backend_url() -> String {
    env_url(
        &["BACKEND_URL", "VITE_BACKEND_URL"],
        "http://localhost:3000",
    )
}

fn authentik_url() -> String {
    env_url(
        &["AUTHENTIK_URL", "VITE_AUTHENTIK_URL"],
        "http://localhost:9000",
    )
}

fn origin_key(url: &Url) -> Option<String> {
    let host = url.host_str()?.to_ascii_lowercase();
    let port = url.port_or_known_default()?;
    Some(format!("{}://{}:{}", url.scheme(), host, port))
}

fn origin_of(raw: &str) -> Option<String> {
    Url::parse(raw).ok().and_then(|url| origin_key(&url))
}

fn login_init_url() -> Url {
    const HTML: &str = include_str!("../login-init.html");
    let mut encoded = String::from("data:text/html;charset=utf-8,");
    for byte in HTML.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }
    encoded.parse().expect("login-init data URL")
}

fn allow_navigation(url: &Url, backend: Option<&str>, authentik: Option<&str>) -> bool {
    match url.scheme() {
        "about" => true,
        "data" => url.as_str() == login_init_url().as_str(),
        "http" | "https" => {
            let origin = origin_key(url);
            origin.as_deref() == backend || origin.as_deref() == authentik
        }
        _ => false,
    }
}

#[tauri::command]
async fn open_login_window(app: tauri::AppHandle, url: Option<String>) -> Result<(), String> {
    let backend = backend_url();
    let authentik = authentik_url();
    let backend_origin = origin_of(&backend);
    let authentik_origin = origin_of(&authentik);
    let auth_login = url.unwrap_or_else(|| format!("{}/auth/login", backend.trim_end_matches('/')));
    let parsed_login = Url::parse(&auth_login).map_err(|e| e.to_string())?;
    if !allow_navigation(
        &parsed_login,
        backend_origin.as_deref(),
        authentik_origin.as_deref(),
    ) {
        return Err("login url is not an allowed origin".into());
    }

    if let Some(existing) = app.get_webview_window(LOGIN_LABEL) {
        existing.destroy().map_err(|e| e.to_string())?;
    }

    let nav_app = app.clone();
    let close_app = app.clone();
    let load_login = parsed_login.clone();
    let ticket_emitted = Arc::new(AtomicBool::new(false));
    let ticket_for_nav = ticket_emitted.clone();
    let ticket_for_close = ticket_emitted;

    // Dev: data-URL spinner (needs security.csp null in tauri.conf — CSP rewrites break data URLs).
    // Release: load auth directly (patch-tauri-config.mjs sets CSP for main window assets).
    #[cfg(debug_assertions)]
    let initial_url = login_init_url();
    #[cfg(not(debug_assertions))]
    let initial_url = parsed_login.clone();

    let window =
        WebviewWindowBuilder::new(&app, LOGIN_LABEL, WebviewUrl::External(initial_url))
            .title("Anmelden")
            .inner_size(480.0, 640.0)
            .min_inner_size(480.0, 640.0)
            .decorations(true)
            .resizable(true)
            .incognito(true)
            .on_navigation(move |url| {
                if url.scheme() == "clared" {
                    if let Some(ticket) = url
                        .query_pairs()
                        .find(|(key, _)| key == "ticket")
                        .map(|(_, value)| value.into_owned())
                    {
                        ticket_for_nav.store(true, Ordering::SeqCst);
                        if let Some(main) = nav_app.get_webview_window("main") {
                            let _ = main.emit(TICKET_EVENT, ticket);
                        }
                    }
                    if let Some(login) = nav_app.get_webview_window(LOGIN_LABEL) {
                        let _ = login.close();
                    }
                    return false;
                }
                allow_navigation(url, backend_origin.as_deref(), authentik_origin.as_deref())
            })
            .build()
            .map_err(|e| e.to_string())?;

    #[cfg(debug_assertions)]
    {
        window.navigate(load_login).map_err(|e| e.to_string())?;
    }

    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Destroyed = event {
            if ticket_for_close.load(Ordering::SeqCst) {
                return;
            }
            if let Some(main) = close_app.get_webview_window("main") {
                let _ = main.emit(CANCEL_EVENT, ());
            }
        }
    });
    Ok(())
}

// D-31 / D-50: prevent-default blocks reload, back/forward, and disruptive zoom in
// release; context menus in inputs stay allowed via plugin defaults. Cmd↔Ctrl
// mapping is handled by tauri-plugin-prevent-default on Windows.
#[cfg(debug_assertions)]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    use tauri_plugin_prevent_default::Flags;
    // D-50: debug keeps F12 DevTools and reload shortcuts for DX.
    tauri_plugin_prevent_default::Builder::new()
        .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
        .build()
}

#[cfg(not(debug_assertions))]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    // D-31: release uses full battery — blocks F5/Ctrl-R reload, back/forward, zoom.
    tauri_plugin_prevent_default::init()
}

fn env_optional(keys: &[&str]) -> String {
    keys.iter()
        .find_map(|key| std::env::var(key).ok().filter(|value| !value.is_empty()))
        .unwrap_or_default()
}

fn sentry_environment() -> String {
    if cfg!(debug_assertions) {
        "dev".into()
    } else {
        let explicit = env_optional(&["SENTRY_ENVIRONMENT", "VITE_SENTRY_ENVIRONMENT"]);
        match explicit.as_str() {
            "dev" | "staging" | "prod" => explicit,
            _ => "prod".into(),
        }
    }
}

const SENTRY_REDACTED: &str = "[redacted]";

fn sentry_key_is_sensitive(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    key == "authorization"
        || key.contains("token")
        || key.contains("password")
        || key.contains("secret")
        || key.contains("keychain")
        || key.contains("session")
        || key.contains("bearer")
        || key.contains("api_key")
        || key.contains("apikey")
}

fn sentry_key_is_name(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    key.contains("customername")
        || key.contains("customer_name")
        || key.contains("recipient")
        || key.contains("kunde")
        || key.contains("rechnungsempf")
}

fn sentry_redact_emails(text: &str) -> String {
    if !text.contains('@') {
        return text.to_string();
    }
    let chars: Vec<char> = text.chars().collect();
    let mut out = String::with_capacity(text.len());
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '@' {
            let mut start = i;
            while start > 0 && !chars[start - 1].is_whitespace() {
                start -= 1;
            }
            let mut end = i + 1;
            while end < chars.len() && !chars[end].is_whitespace() {
                end += 1;
            }
            if end > start + 1 {
                out.push_str(SENTRY_REDACTED);
                i = end;
                continue;
            }
        }
        out.push(chars[i]);
        i += 1;
    }
    out
}

fn find_ascii_insensitive(haystack: &str, needle: &str) -> Option<usize> {
    if needle.is_empty() || haystack.len() < needle.len() {
        return None;
    }
    haystack
        .char_indices()
        .filter(|(i, _)| haystack[*i..].len() >= needle.len())
        .find(|(i, _)| {
            haystack[*i..]
                .chars()
                .zip(needle.chars())
                .all(|(a, b)| a.eq_ignore_ascii_case(&b))
        })
        .map(|(i, _)| i)
}

fn sentry_redact_customer_names_in_text(text: &str) -> String {
    const MARKERS: &[&str] = &[
        "Kunde:", "Kunde ", "Kundin:", "Kundin ",
        "customer:", "customer ", "Customer:", "Customer ",
        "Rechnungsempfänger:", "Rechnungsempfänger ",
        "recipient:", "recipient ",
    ];
    const LEGAL_SUFFIXES: &[&str] = &[" GmbH", " AG", " KG", " OHG", " UG", " e.V."];

    let mut out = text.to_string();
    loop {
        let mut replacement: Option<(usize, usize)> = None;
        for marker in MARKERS {
            let Some(start) = find_ascii_insensitive(&out, marker) else {
                continue;
            };
            let mut end = start + marker.len();
            while end < out.len() {
                let Some(ch) = out[end..].chars().next() else {
                    break;
                };
                if !ch.is_whitespace() {
                    break;
                }
                end += ch.len_utf8();
            }
            let name_begin = end;
            while end < out.len() {
                let ch = out[end..].chars().next().unwrap();
                if ch.is_whitespace() {
                    break;
                }
                end += ch.len_utf8();
            }
            for suffix in LEGAL_SUFFIXES {
                if out[end..].starts_with(suffix) {
                    end += suffix.len();
                    break;
                }
            }
            if end > name_begin && &out[name_begin..end] != SENTRY_REDACTED {
                replacement = Some((name_begin, end));
                break;
            }
        }
        match replacement {
            Some((name_begin, name_end)) => {
                out.replace_range(name_begin..name_end, SENTRY_REDACTED);
            }
            None => break,
        }
    }
    out
}

fn sentry_redact_message(text: &str) -> String {
    sentry_redact_customer_names_in_text(&sentry_redact_string(text, None))
}

fn sentry_redact_string(value: &str, key: Option<&str>) -> String {
    if let Some(key) = key {
        if sentry_key_is_sensitive(key) || sentry_key_is_name(key) {
            return SENTRY_REDACTED.to_string();
        }
    }
    if value.to_ascii_lowercase().contains("bearer ") {
        return SENTRY_REDACTED.to_string();
    }
    sentry_redact_emails(value)
}

fn sentry_scrub_value(
    value: sentry::protocol::Value,
    key: Option<&str>,
) -> sentry::protocol::Value {
    use sentry::protocol::Value;
    match value {
        Value::String(text) => Value::String(sentry_redact_string(&text, key)),
        Value::Array(items) => Value::Array(
            items
                .into_iter()
                .map(|item| sentry_scrub_value(item, key))
                .collect(),
        ),
        Value::Object(map) => Value::Object(sentry_scrub_json_map(map)),
        other => other,
    }
}

fn sentry_scrub_json_map(
    map: serde_json::Map<String, sentry::protocol::Value>,
) -> serde_json::Map<String, sentry::protocol::Value> {
    let mut out = serde_json::Map::new();
    for (key, value) in map {
        if key.to_ascii_lowercase() == "authorization" {
            continue;
        }
        if sentry_key_is_sensitive(&key) {
            out.insert(key, sentry::protocol::Value::String(SENTRY_REDACTED.into()));
            continue;
        }
        out.insert(key.clone(), sentry_scrub_value(value, Some(&key)));
    }
    out
}

fn sentry_scrub_map(
    map: sentry::protocol::Map<String, sentry::protocol::Value>,
) -> sentry::protocol::Map<String, sentry::protocol::Value> {
    let mut out = sentry::protocol::Map::new();
    for (key, value) in map {
        if key.to_ascii_lowercase() == "authorization" {
            continue;
        }
        if sentry_key_is_sensitive(&key) {
            out.insert(key, sentry::protocol::Value::String(SENTRY_REDACTED.into()));
            continue;
        }
        out.insert(key.clone(), sentry_scrub_value(value, Some(&key)));
    }
    out
}

fn sentry_scrub_user(mut user: sentry::protocol::User) -> sentry::protocol::User {
    if user.email.is_some() {
        user.email = Some(SENTRY_REDACTED.to_string());
    }
    user.other = sentry_scrub_map(user.other);
    user
}

fn sentry_scrub_request(mut request: sentry::protocol::Request) -> sentry::protocol::Request {
    request.headers.retain(|key, _| key.to_ascii_lowercase() != "authorization");
    for value in request.headers.values_mut() {
        *value = sentry_redact_string(value, None);
    }
    request.env = request
        .env
        .into_iter()
        .filter(|(key, _)| key.to_ascii_lowercase() != "authorization")
        .map(|(key, value)| {
            let redacted = sentry_redact_string(&value, Some(&key));
            (key, redacted)
        })
        .collect();
    request
}

fn sentry_scrub_event(mut event: sentry::protocol::Event<'static>) -> sentry::protocol::Event<'static> {
    if let Some(message) = event.message.as_mut() {
        *message = sentry_redact_message(message);
    }
    for exception in event.exception.iter_mut() {
        if let Some(value) = exception.value.as_mut() {
            *value = sentry_redact_message(value);
        }
    }
    if let Some(request) = event.request.take() {
        event.request = Some(sentry_scrub_request(request));
    }
    if let Some(user) = event.user.take() {
        event.user = Some(sentry_scrub_user(user));
    }
    event.extra = sentry_scrub_map(event.extra);
    event.tags = event
        .tags
        .into_iter()
        .map(|(key, value)| {
            let redacted = sentry_redact_string(&value, Some(&key));
            (key, redacted)
        })
        .collect();
    for crumb in event.breadcrumbs.as_mut() {
        if let Some(message) = crumb.message.as_mut() {
            *message = sentry_redact_message(message);
        }
        crumb.data = sentry_scrub_map(std::mem::take(&mut crumb.data));
    }
    event
}

fn sentry_plugin() -> Option<tauri::plugin::TauriPlugin<tauri::Wry>> {
    use std::sync::OnceLock;

    static SENTRY_GUARD: OnceLock<sentry::ClientInitGuard> = OnceLock::new();

    let dsn = env_optional(&["SENTRY_DSN", "VITE_SENTRY_DSN"]);
    if dsn.is_empty() {
        return None;
    }

    let mut options = sentry::ClientOptions::default();
    options.release = Some(format!("clared@{}", env!("APP_VERSION")).into());
    options.environment = Some(sentry_environment().into());
    options.send_default_pii = false;
    options.before_send = Some(std::sync::Arc::new(|event| Some(sentry_scrub_event(event))));

    let guard = sentry::init((dsn.as_str(), options));
    SENTRY_GUARD.set(guard).ok()?;

    let client = sentry::Hub::current().client()?;
    Some(tauri_plugin_sentry::init_with_no_injection(client.as_ref()))
}

fn log_plugin() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    use log::LevelFilter;
    use tauri_plugin_log::{Builder, Target, TargetKind};

    // D-42/D-43/D-44: LogDir + plugin rotation defaults; debug in dev, info in release.
    let level = if cfg!(debug_assertions) {
        LevelFilter::Debug
    } else {
        LevelFilter::Info
    };

    Builder::new()
        .level(level)
        .target(Target::new(TargetKind::LogDir { file_name: None }))
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().plugin(tauri_plugin_clipboard_manager::init());

    if let Some(sentry) = sentry_plugin() {
        builder = builder.plugin(sentry);
    }

    builder = builder
        .plugin(log_plugin())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::new()
            .with_filter(|label| label != LOGIN_LABEL)
            .build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(prevent_default());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_process::init());
    }

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            println!(
                "a new app instance was opened with {argv:?} and the deep link event was already triggered"
            );
        }));
    }

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(
            tauri_plugin_mcp_bridge::Builder::new()
                .bind_address("127.0.0.1")
                .build(),
        );
    }

    builder
        .on_web_content_process_terminate(|webview| {
            if webview.label() == LOGIN_LABEL {
                let _ = webview.window().close();
            } else if let Err(error) = webview.reload() {
                log::error!("failed to reload webview after content process exit: {error}");
            }
        })
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            keychain_set_session,
            keychain_get_session,
            keychain_delete_session,
            open_login_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod sentry_scrub_tests {
    use super::{sentry_redact_message, SENTRY_REDACTED};

    #[test]
    fn redacts_customer_name_in_message_text() {
        let out = sentry_redact_message("Kunde: Acme GmbH viewed invoice");
        assert!(!out.contains("Acme"));
        assert!(out.contains(SENTRY_REDACTED));
    }

    #[test]
    fn redacts_customer_name_and_email_in_exception_text() {
        let out = sentry_redact_message("Kunde: Acme GmbH failed for user@example.com");
        assert!(!out.contains("Acme"));
        assert!(!out.contains('@'));
        assert!(out.contains(SENTRY_REDACTED));
    }
}
