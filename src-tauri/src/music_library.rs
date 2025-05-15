use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::error::Error;
use std::io;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Song {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: u64, // 单位：秒
    pub path: String,
    pub cover: Option<String>,
}

// 扫描音乐目录
pub async fn scan_music_directory(path: &str) -> Result<Vec<Song>, Box<dyn Error>> {
    let mut songs = Vec::new();
    let dir_path = Path::new(path);
    
    if !dir_path.exists() || !dir_path.is_dir() {
        return Err(format!("无效的目录路径: {}", path).into());
    }
    
    // 递归遍历目录
    walk_directory(dir_path, &mut songs)?;
    
    Ok(songs)
}

// 递归遍历目录
fn walk_directory(dir: &Path, songs: &mut Vec<Song>) -> io::Result<()> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                walk_directory(&path, songs)?;
            } else if is_music_file(&path) {
                if let Some(song) = extract_song_info(&path) {
                    songs.push(song);
                }
            }
        }
    }
    
    Ok(())
}

// 判断是否为音乐文件
fn is_music_file(path: &Path) -> bool {
    if let Some(ext) = path.extension() {
        let ext_str = ext.to_string_lossy().to_lowercase();
        return ["mp3", "flac", "wav", "ogg", "m4a", "aac"].contains(&ext_str.as_str());
    }
    false
}

// 提取歌曲信息
fn extract_song_info(path: &Path) -> Option<Song> {
    let path_str = path.to_string_lossy().to_string();
    let file_name = path.file_name()?.to_string_lossy();
    
    // 这里应该使用音频元数据库来提取歌曲信息
    // 现在只是简单地从文件名提取
    let file_stem = path.file_stem()?.to_string_lossy();
    
    // 非常基础的解析，在实际应用中应当使用诸如 id3 或 metaflac 这样的库
    let parts: Vec<&str> = file_stem.split(" - ").collect();
    
    let (title, artist, album) = if parts.len() >= 2 {
        (parts[1].to_string(), parts[0].to_string(), "未知专辑".to_string())
    } else {
        (file_stem.to_string(), "未知艺术家".to_string(), "未知专辑".to_string())
    };
    
    // 生成唯一ID
    let id = format!("song-{}", path_str.as_bytes().iter().map(|&b| b as u64).sum::<u64>());
    
    Some(Song {
        id,
        title,
        artist,
        album,
        duration: 0, // 需要通过音频库获取
        path: path_str,
        cover: None,
    })
} 