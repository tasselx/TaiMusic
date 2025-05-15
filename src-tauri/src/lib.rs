// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod music_library;
use music_library::{scan_music_directory, Song};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn scan_directory(path: String) -> Result<Vec<Song>, String> {
    match scan_music_directory(&path).await {
        Ok(songs) => Ok(songs),
        Err(err) => Err(format!("Error scanning directory: {}", err))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
