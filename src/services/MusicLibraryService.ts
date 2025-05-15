import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-opener';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  cover?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: string[]; // Song IDs
}

// 这个服务将来会与Rust后端交互
export class MusicLibraryService {
  // 选择音乐文件夹
  async selectMusicFolder(): Promise<string | null> {
    try {
      // 这里将来需要使用Tauri的API来选择文件夹
      // 现在只是一个模拟实现
      return '/Users/Music';
    } catch (error) {
      console.error('选择音乐文件夹失败:', error);
      return null;
    }
  }

  // 扫描音乐库
  async scanLibrary(path: string): Promise<Song[]> {
    try {
      // 调用Rust后端扫描文件夹
      const songs = await invoke<Song[]>('scan_directory', { path });
      return songs;
    } catch (error) {
      console.error('扫描音乐库失败:', error);
      // 失败时返回模拟数据
      return this.getMockSongs();
    }
  }

  // 播放音乐
  async playSong(song: Song): Promise<boolean> {
    try {
      // 使用Tauri的API来播放音乐
      await open(song.path);
      return true;
    } catch (error) {
      console.error('播放音乐失败:', error);
      return false;
    }
  }

  // 创建播放列表
  async createPlaylist(name: string): Promise<Playlist | null> {
    try {
      // 这里将来需要调用Rust后端创建播放列表
      // 现在只是一个模拟实现
      const id = `playlist-${Date.now()}`;
      return {
        id,
        name,
        songs: [],
      };
    } catch (error) {
      console.error('创建播放列表失败:', error);
      return null;
    }
  }

  // 获取模拟歌曲数据
  private getMockSongs(): Song[] {
    const artists = ['周杰伦', '林俊杰', '陈奕迅', '张学友', '邓紫棋'];
    const albums = [
      '十一月的萧邦',
      '依然范特西',
      '叶惠美',
      '不能说的秘密',
      '七里香',
      '伟大的渺小',
      'JJ陆',
      '新地球',
      'Rice & Shine',
      'DUO',
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const album = albums[Math.floor(Math.random() * albums.length)];
      const duration = Math.floor(Math.random() * 300) + 120; // 2-7分钟

      return {
        id: `song-${i}`,
        title: `歌曲标题 ${i + 1}`,
        artist,
        album,
        duration,
        path: `/music/song-${i}.mp3`,
        cover: `https://via.placeholder.com/120?text=${album}`,
      };
    });
  }
} 