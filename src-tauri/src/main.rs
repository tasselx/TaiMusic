// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 注意：不再启动内部API服务，请先手动运行 node external-api-server.js
    println!("正在启动Tauri应用，请确保已启动外部API服务器...");

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
