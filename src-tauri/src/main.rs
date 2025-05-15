// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod music_library;

use crate::music_library::{scan_music_directory, Song};
use tokio::process::Command;
use std::path::PathBuf;
use tauri::{Manager, AppHandle};
use tokio::io::{AsyncBufReadExt, BufReader as TokioBufReader};
use std::process::Command;
use std::sync::Mutex;
use tauri::{command, Manager};

// For pre_exec on Unix with tokio::process::Command, no specific CommandExt import is needed here usually,
// as pre_exec is an unsafe method on Command itself for Unix targets.

// 扫描音乐目录
#[tauri::command]
async fn scan_directory(path: String) -> Result<Vec<Song>, String> {
    match scan_music_directory(&path).await {
        Ok(songs) => Ok(songs),
        Err(err) => Err(format!("Error scanning directory: {}", err))
    }
}

// 用于存储酷狗API服务进程信息的结构
struct ApiProcessState {
    process_handle: Option<std::process::Child>,
}

impl ApiProcessState {
    fn new() -> Self {
        ApiProcessState {
            process_handle: None,
        }
    }
}

// 将API进程状态存储在应用程序状态中
#[derive(Default)]
struct AppState {
    api_process: Mutex<ApiProcessState>,
}

// 启动酷狗API服务器
#[command]
fn start_kugou_api_server(
    port: u16,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let mut api_state = state.api_process.lock().map_err(|e| e.to_string())?;
    
    // 如果已经有进程在运行，先停止它
    if api_state.process_handle.is_some() {
        return Ok("酷狗API服务器已经在运行".to_string());
    }
    
    // 获取kugou_api_service目录路径
    let app_dir = app_handle
        .path_resolver()
        .app_dir()
        .ok_or_else(|| "无法获取应用目录".to_string())?;
    
    let api_dir = app_dir.join("../kugou_api_service");
    
    println!("启动酷狗API服务器，路径: {:?}", api_dir);
    
    // 使用node运行服务
    let process = Command::new("node")
        .arg("server.js")
        .env("PORT", port.to_string())
        .current_dir(api_dir)
        .spawn()
        .map_err(|e| format!("无法启动酷狗API服务器: {}", e))?;
    
    // 保存进程句柄
    api_state.process_handle = Some(process);
    
    Ok(format!("酷狗API服务器已启动，端口: {}", port))
}

// 停止酷狗API服务器
#[command]
fn stop_kugou_api_server(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut api_state = state.api_process.lock().map_err(|e| e.to_string())?;
    
    if let Some(mut process) = api_state.process_handle.take() {
        // 在Windows上，kill()可能不会终止子进程，需要使用taskkill
        #[cfg(target_os = "windows")]
        {
            let pid = process.id();
            Command::new("taskkill")
                .args(&["/F", "/T", "/PID", &pid.to_string()])
                .spawn()
                .map_err(|e| format!("无法使用taskkill终止进程: {}", e))?;
        }
        
        // 在非Windows平台上，使用kill()
        #[cfg(not(target_os = "windows"))]
        {
            process.kill().map_err(|e| format!("无法终止API服务器进程: {}", e))?;
        }
        
        println!("酷狗API服务器已停止");
        Ok("酷狗API服务器已停止".to_string())
    } else {
        Ok("酷狗API服务器未运行".to_string())
    }
}

// 示例：问候功能
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            api_process: Mutex::new(ApiProcessState::new()),
        })
        .invoke_handler(tauri::generate_handler![greet, scan_directory, start_kugou_api_server, stop_kugou_api_server])
        .setup(|app| {
            // 当应用退出时，确保API服务器进程被终止
            let app_handle = app.handle();
            app.listen_global("tauri://close-requested", move |_| {
                let state = app_handle.state::<AppState>();
                let mut api_state = state.api_process.lock().unwrap();
                if let Some(mut process) = api_state.process_handle.take() {
                    // 尝试终止进程
                    let _ = process.kill();
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动应用程序时出错");
}
