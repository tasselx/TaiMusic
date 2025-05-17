import { create } from 'zustand';
import { Song } from './types';

/**
 * 播放器状态接口
 */
interface PlayerState {
  // 当前播放状态
  isPlaying: boolean;
  // 当前播放歌曲
  currentSong: Song | null;
  // 播放列表
  playlist: Song[];
  // 播放进度 (0-100)
  progress: number;
  // 音量 (0-100)
  volume: number;
  // 播放模式 (0: 顺序播放, 1: 随机播放, 2: 单曲循环)
  playMode: number;
  
  // 操作方法
  setPlaying: (isPlaying: boolean) => void;
  setCurrentSong: (song: Song) => void;
  setPlaylist: (playlist: Song[]) => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: number) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPlayMode: (mode: number) => void;
  
  // 播放控制
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
}

/**
 * 播放器状态管理
 */
const usePlayerStore = create<PlayerState>((set, get) => ({
  // 初始状态
  isPlaying: false,
  currentSong: null,
  playlist: [],
  progress: 0,
  volume: 80,
  playMode: 0,
  
  // 设置播放状态
  setPlaying: (isPlaying) => set({ isPlaying }),
  
  // 设置当前歌曲
  setCurrentSong: (song) => set({ currentSong: song }),
  
  // 设置播放列表
  setPlaylist: (playlist) => set({ playlist }),
  
  // 添加歌曲到播放列表
  addToPlaylist: (song) => {
    const { playlist } = get();
    // 检查歌曲是否已存在于播放列表中
    if (!playlist.some(item => item.id === song.id)) {
      set({ playlist: [...playlist, song] });
    }
  },
  
  // 从播放列表中移除歌曲
  removeFromPlaylist: (songId) => {
    const { playlist, currentSong } = get();
    const newPlaylist = playlist.filter(song => song.id !== songId);
    set({ playlist: newPlaylist });
    
    // 如果移除的是当前播放的歌曲，则停止播放
    if (currentSong && currentSong.id === songId) {
      set({ isPlaying: false, currentSong: null });
    }
  },
  
  // 设置播放进度
  setProgress: (progress) => set({ progress }),
  
  // 设置音量
  setVolume: (volume) => set({ volume }),
  
  // 设置播放模式
  setPlayMode: (mode) => set({ playMode: mode }),
  
  // 播放
  play: () => set({ isPlaying: true }),
  
  // 暂停
  pause: () => set({ isPlaying: false }),
  
  // 切换播放状态
  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },
  
  // 下一首
  next: () => {
    const { playlist, currentSong, playMode } = get();
    if (!playlist.length || !currentSong) return;
    
    let nextIndex = 0;
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    
    if (playMode === 1) {
      // 随机播放
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      // 顺序播放
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    set({ currentSong: playlist[nextIndex], isPlaying: true });
  },
  
  // 上一首
  previous: () => {
    const { playlist, currentSong, playMode } = get();
    if (!playlist.length || !currentSong) return;
    
    let prevIndex = 0;
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    
    if (playMode === 1) {
      // 随机播放
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      // 顺序播放
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    
    set({ currentSong: playlist[prevIndex], isPlaying: true });
  }
}));

export default usePlayerStore;
