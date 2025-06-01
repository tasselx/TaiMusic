/**
 * 音频播放器状态管理
 * 基于Zustand的音频播放器状态管理，集成AudioPlayer类
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AudioPlayer, { Song, PlayMode, PlayState, PlayerEvents } from '../utils/audioPlayer';
import { audioCacheManager, CacheStats } from '../utils/audioCacheManager';

// 播放历史记录接口
export interface PlayHistory {
  song: Song;
  playedAt: number;
  playCount: number;
}

// 收藏列表接口
export interface Favorite {
  song: Song;
  addedAt: number;
}

// 播放器状态接口
interface AudioPlayerState {
  // 播放器实例
  player: AudioPlayer | null;
  
  // 播放状态
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  volume: number;
  muted: boolean;
  playMode: PlayMode;
  progress: number;
  duration: number;
  state: PlayState;
  
  // 播放历史和收藏
  playHistory: PlayHistory[];
  favorites: Favorite[];
  
  // 缓存统计
  cacheStats: CacheStats | null;
  
  // 播放器控制方法
  initializePlayer: () => void;
  destroyPlayer: () => void;
  
  // 播放控制
  play: (song?: Song) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  previous: () => Promise<void>;
  next: () => Promise<void>;
  
  // 队列管理
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song, index?: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // 播放控制
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlayMode: (mode: PlayMode) => void;
  seek: (position: number) => void;
  
  // 历史记录管理
  addToHistory: (song: Song) => void;
  clearHistory: () => void;
  getRecentlyPlayed: (limit?: number) => PlayHistory[];
  
  // 收藏管理
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  
  // 缓存管理
  updateCacheStats: () => Promise<void>;
  clearCache: () => Promise<void>;
}

// 创建播放器状态管理
export const useAudioPlayerStore = create<AudioPlayerState>()(
  persist(
    (set, get) => {
      let playerInstance: AudioPlayer | null = null;

      // 播放器事件处理
      const playerEvents: PlayerEvents = {
        onPlay: (song) => {
          set({ currentSong: song, isPlaying: true, isPaused: false, state: PlayState.PLAYING });
          get().addToHistory(song);
        },
        onPause: () => {
          set({ isPlaying: false, isPaused: true, state: PlayState.PAUSED });
        },
        onStop: () => {
          set({ isPlaying: false, isPaused: false, state: PlayState.STOPPED });
        },
        onLoad: () => {
          set({ isLoading: false, state: PlayState.PLAYING });
        },
        onLoadError: (error) => {
          console.error('播放器加载错误:', error);
          set({ isLoading: false, state: PlayState.ERROR });
        },
        onProgress: (progress, duration) => {
          set({ progress, duration });
        },
        onVolumeChange: (volume) => {
          set({ volume });
        },
        onModeChange: (mode) => {
          set({ playMode: mode });
        },
        onSongChange: (song) => {
          set({ currentSong: song });
        },
        onQueueChange: (queue) => {
          set({ queue });
        }
      };

      return {
        // 初始状态
        player: null,
        currentSong: null,
        queue: [],
        currentIndex: -1,
        isPlaying: false,
        isPaused: false,
        isLoading: false,
        volume: 0.8,
        muted: false,
        playMode: PlayMode.SEQUENCE,
        progress: 0,
        duration: 0,
        state: PlayState.IDLE,
        playHistory: [],
        favorites: [],
        cacheStats: null,

        // 初始化播放器
        initializePlayer: () => {
          if (!playerInstance) {
            playerInstance = new AudioPlayer(playerEvents);
            set({ player: playerInstance });
            
            // 恢复播放器状态
            const state = get();
            playerInstance.setVolume(state.volume);
            playerInstance.setPlayMode(state.playMode);
            if (state.muted) {
              playerInstance.toggleMute();
            }
            
            console.log('音频播放器初始化完成');
          }
        },

        // 销毁播放器
        destroyPlayer: () => {
          if (playerInstance) {
            playerInstance.destroy();
            playerInstance = null;
            set({ player: null });
          }
        },

        // 播放歌曲
        play: async (song?: Song) => {
          const state = get();
          
          if (!playerInstance) {
            state.initializePlayer();
          }

          if (song) {
            // 播放指定歌曲
            const existingIndex = state.queue.findIndex(s => s.id === song.id);
            if (existingIndex !== -1) {
              // 歌曲已在队列中
              set({ currentIndex: existingIndex });
              await playerInstance?.playByIndex(existingIndex);
            } else {
              // 添加到队列并播放
              const newQueue = [...state.queue, song];
              const newIndex = newQueue.length - 1;
              set({ queue: newQueue, currentIndex: newIndex });
              playerInstance?.setQueue(newQueue, newIndex);
              await playerInstance?.play();
            }
          } else {
            // 播放当前歌曲或队列中的歌曲
            if (state.isPaused) {
              playerInstance?.resume();
            } else {
              set({ isLoading: true });
              await playerInstance?.play();
            }
          }
        },

        // 暂停播放
        pause: () => {
          playerInstance?.pause();
        },

        // 恢复播放
        resume: () => {
          playerInstance?.resume();
        },

        // 停止播放
        stop: () => {
          playerInstance?.stop();
        },

        // 上一首
        previous: async () => {
          await playerInstance?.previous();
        },

        // 下一首
        next: async () => {
          await playerInstance?.next();
        },

        // 设置播放队列
        setQueue: (songs: Song[], startIndex = 0) => {
          if (!playerInstance) {
            get().initializePlayer();
          }
          
          set({ queue: songs, currentIndex: startIndex });
          playerInstance?.setQueue(songs, startIndex);
        },

        // 添加到队列
        addToQueue: (song: Song, index?: number) => {
          if (!playerInstance) {
            get().initializePlayer();
          }
          
          playerInstance?.addToQueue(song, index);
        },

        // 从队列移除
        removeFromQueue: (index: number) => {
          playerInstance?.removeFromQueue(index);
        },

        // 清空队列
        clearQueue: () => {
          set({ queue: [], currentIndex: -1, currentSong: null });
          playerInstance?.setQueue([]);
        },

        // 设置音量
        setVolume: (volume: number) => {
          set({ volume });
          playerInstance?.setVolume(volume);
        },

        // 切换静音
        toggleMute: () => {
          const newMuted = !get().muted;
          set({ muted: newMuted });
          playerInstance?.toggleMute();
        },

        // 设置播放模式
        setPlayMode: (mode: PlayMode) => {
          set({ playMode: mode });
          playerInstance?.setPlayMode(mode);
        },

        // 设置播放进度
        seek: (position: number) => {
          playerInstance?.seek(position);
        },

        // 添加到播放历史
        addToHistory: (song: Song) => {
          const state = get();
          const existingIndex = state.playHistory.findIndex(h => h.song.id === song.id);
          
          if (existingIndex !== -1) {
            // 更新现有记录
            const updatedHistory = [...state.playHistory];
            updatedHistory[existingIndex] = {
              ...updatedHistory[existingIndex],
              playedAt: Date.now(),
              playCount: updatedHistory[existingIndex].playCount + 1
            };
            set({ playHistory: updatedHistory });
          } else {
            // 添加新记录
            const newHistory = [
              { song, playedAt: Date.now(), playCount: 1 },
              ...state.playHistory.slice(0, 999) // 限制历史记录数量
            ];
            set({ playHistory: newHistory });
          }
        },

        // 清空播放历史
        clearHistory: () => {
          set({ playHistory: [] });
        },

        // 获取最近播放
        getRecentlyPlayed: (limit = 20) => {
          return get().playHistory
            .sort((a, b) => b.playedAt - a.playedAt)
            .slice(0, limit);
        },

        // 添加到收藏
        addToFavorites: (song: Song) => {
          const state = get();
          if (!state.favorites.some(f => f.song.id === song.id)) {
            const newFavorites = [
              { song, addedAt: Date.now() },
              ...state.favorites
            ];
            set({ favorites: newFavorites });
          }
        },

        // 从收藏移除
        removeFromFavorites: (songId: string) => {
          const state = get();
          const newFavorites = state.favorites.filter(f => f.song.id !== songId);
          set({ favorites: newFavorites });
        },

        // 检查是否收藏
        isFavorite: (songId: string) => {
          return get().favorites.some(f => f.song.id === songId);
        },

        // 更新缓存统计
        updateCacheStats: async () => {
          try {
            const stats = await audioCacheManager.getStats();
            set({ cacheStats: stats });
          } catch (error) {
            console.error('获取缓存统计失败:', error);
          }
        },

        // 清空缓存
        clearCache: async () => {
          try {
            await audioCacheManager.clearAll();
            await get().updateCacheStats();
          } catch (error) {
            console.error('清空缓存失败:', error);
          }
        }
      };
    },
    {
      name: 'audio-player-storage',
      // 只持久化部分状态
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        playMode: state.playMode,
        playHistory: state.playHistory,
        favorites: state.favorites,
        queue: state.queue,
        currentIndex: state.currentIndex
      })
    }
  )
);

// 导出类型
export type { Song, PlayMode, PlayState };
export default useAudioPlayerStore;
