fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(tauri_build::AppManifest::new().commands(&[
            "keychain_set_session",
            "keychain_get_session",
            "keychain_delete_session",
        ])),
    )
    .expect("failed to run tauri-build");
}
