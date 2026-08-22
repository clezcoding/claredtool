const KEYCHAIN_SERVICE: &str = "com.clared.app";
const KEYCHAIN_ACCOUNT: &str = "session";

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

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            keychain_set_session,
            keychain_get_session,
            keychain_delete_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
