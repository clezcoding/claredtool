use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    Emitter, Manager, Url, WebviewUrl, WebviewWindowBuilder, webview::PageLoadEvent,
};

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
    env_url(&["BACKEND_URL", "VITE_BACKEND_URL"], "http://localhost:3000")
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

fn login_csp(backend: &str, authentik: &str) -> String {
    // Meta CSP is defense-in-depth only; Chromium/WebKit may ignore script-injected
    // meta tags after parse. Origin allowlist in allow_navigation is the real control.
    let backend = origin_of(backend).unwrap_or_default();
    let authentik = origin_of(authentik).unwrap_or_default();
    format!(
        "default-src 'self' {backend} {authentik}; img-src 'self' data: {backend} {authentik}; style-src 'self' 'unsafe-inline' {backend} {authentik}; script-src 'self' {backend} {authentik}; connect-src 'self' {backend} {authentik}; form-action {backend} {authentik}; frame-src {backend} {authentik}"
    )
}

fn csp_init_script(backend: &str, authentik: &str) -> String {
    let content = serde_json::to_string(&login_csp(backend, authentik)).expect("csp json");
    format!(
        "(function(){{var m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';m.content={content};(document.head||document.documentElement).appendChild(m);}})();"
    )
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
    let auth_login = url.unwrap_or_else(|| {
        format!("{}/auth/login", backend.trim_end_matches('/'))
    });
    let parsed_login = Url::parse(&auth_login).map_err(|e| e.to_string())?;
    if !allow_navigation(
        &parsed_login,
        backend_origin.as_deref(),
        authentik_origin.as_deref(),
    ) {
        return Err("login url is not an allowed origin".into());
    }

    if let Some(existing) = app.get_webview_window(LOGIN_LABEL) {
        let _ = existing.navigate(parsed_login);
        existing.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }
    let csp_script = csp_init_script(&backend, &authentik);

    let nav_app = app.clone();
    let close_app = app.clone();
    let load_login = parsed_login;
    let ticket_emitted = Arc::new(AtomicBool::new(false));
    let ticket_for_nav = ticket_emitted.clone();
    let ticket_for_close = ticket_emitted;

    let window = WebviewWindowBuilder::new(
        &app,
        LOGIN_LABEL,
        WebviewUrl::External(login_init_url()),
    )
    .title("Anmelden")
    .inner_size(480.0, 640.0)
    .min_inner_size(480.0, 640.0)
    .decorations(true)
    .resizable(true)
    .initialization_script(&csp_script)
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
    .on_page_load(move |window, payload| {
        if payload.event() == PageLoadEvent::Finished && payload.url().scheme() == "data" {
            let _ = window.navigate(load_login.clone());
        }
    })
    .build()
    .map_err(|e| e.to_string())?;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

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
