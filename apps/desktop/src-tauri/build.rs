use std::env;
use std::fs;
use std::path::Path;

fn app_version() -> String {
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let conf_path = Path::new(&manifest_dir).join("tauri.conf.json");
    let conf: serde_json::Value = serde_json::from_str(
        &fs::read_to_string(&conf_path)
            .unwrap_or_else(|err| panic!("failed to read {}: {err}", conf_path.display())),
    )
    .expect("invalid tauri.conf.json");
    conf.get("version")
        .and_then(|value| value.as_str())
        .expect("tauri.conf.json missing version")
        .to_string()
}

fn main() {
    let version = app_version();
    println!("cargo:rustc-env=APP_VERSION={version}");
    println!("cargo:rerun-if-changed=tauri.conf.json");
    println!("cargo:rerun-if-changed=capabilities");

    let tauri_attrs = if cfg!(debug_assertions) {
        tauri_build::Attributes::new().capabilities_path_pattern("./capabilities/*.json")
    } else {
        tauri_build::Attributes::new()
            .capabilities_path_pattern("./capabilities/{default,login}.json")
    };

    tauri_build::try_build(
        tauri_attrs.app_manifest(tauri_build::AppManifest::new().commands(&[
            "keychain_set_session",
            "keychain_get_session",
            "keychain_delete_session",
            "open_login_window",
        ])),
    )
    .expect("failed to run tauri-build");
}
