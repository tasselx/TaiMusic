/**
 * 音频播放器核心类
 * 基于Howler.js实现的功能完备的音频播放器，支持缓存、队列管理等功能
 */
import { Howl, Howler } from 'howler';
import { audioCacheManager } from './audioCacheManager';

// 播放模式枚举
export enum PlayMode {
  SEQUENCE = 'sequence', // 顺序播放
  LOOP = 'loop', // 列表循环
  SINGLE = 'single', // 单曲循环
  RANDOM = 'random' // 随机播放
}

// 播放状态枚举
export enum PlayState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  ERROR = 'error'
}

// 歌曲信息接口
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  url: string;
  coverUrl?: string;
  quality?: string;
}

// 播放器事件接口
export interface PlayerEvents {
  onPlay?: (song: Song) => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onLoad?: () => void;
  onLoadError?: (error: any) => void;
  onProgress?: (progress: number, duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onModeChange?: (mode: PlayMode) => void;
  onSongChange?: (song: Song | null) => void;
  onQueueChange?: (queue: Song[]) => void;
}

// 播放器状态接口
export interface PlayerState {
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
}

class AudioPlayer {
  private howl: Howl | null = null;
  private queue: Song[] = [];
  private currentIndex: number = -1;
  private playMode: PlayMode = PlayMode.SEQUENCE;
  private volume: number = 0.8;
  private muted: boolean = false;
  private state: PlayState = PlayState.IDLE;
  private events: PlayerEvents = {};
  private progressTimer: number | null = null;
  private preloadedSongs: Map<string, Howl> = new Map();

  constructor(events: PlayerEvents = {}) {
    this.events = events;
    this.setupGlobalVolume();
  }

  /**
   * 设置全局音量
   */
  private setupGlobalVolume(): void {
    Howler.volume(this.volume);
  }

  /**
   * 设置事件监听器
   */
  setEvents(events: PlayerEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * 获取当前播放器状态
   */
  getState(): PlayerState {
    return {
      currentSong: this.getCurrentSong(),
      queue: [...this.queue],
      currentIndex: this.currentIndex,
      isPlaying: this.state === PlayState.PLAYING,
      isPaused: this.state === PlayState.PAUSED,
      isLoading: this.state === PlayState.LOADING,
      volume: this.volume,
      muted: this.muted,
      playMode: this.playMode,
      progress: this.getProgress(),
      duration: this.getDuration(),
      state: this.state
    };
  }

  /**
   * 设置播放队列
   */
  setQueue(songs: Song[], startIndex: number = 0): void {
    this.queue = [...songs];
    this.currentIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
    this.events.onQueueChange?.(this.queue);
    this.events.onSongChange?.(this.getCurrentSong());
  }

  /**
   * 添加歌曲到队列
   */
  addToQueue(song: Song, index?: number): void {
    if (index !== undefined) {
      this.queue.splice(index, 0, song);
      if (index <= this.currentIndex) {
        this.currentIndex++;
      }
    } else {
      this.queue.push(song);
    }
    this.events.onQueueChange?.(this.queue);
  }

  /**
   * 从队列移除歌曲
   */
  removeFromQueue(index: number): void {
    if (index < 0 || index >= this.queue.length) return;

    this.queue.splice(index, 1);
    
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex) {
      if (this.currentIndex >= this.queue.length) {
        this.currentIndex = this.queue.length - 1;
      }
      // 如果移除的是当前播放的歌曲，停止播放
      this.stop();
    }

    this.events.onQueueChange?.(this.queue);
    this.events.onSongChange?.(this.getCurrentSong());
  }

  /**
   * 获取当前歌曲
   */
  getCurrentSong(): Song | null {
    return this.currentIndex >= 0 && this.currentIndex < this.queue.length 
      ? this.queue[this.currentIndex] 
      : null;
  }

  /**
   * 播放指定索引的歌曲
   */
  async playByIndex(index: number): Promise<void> {
    if (index < 0 || index >= this.queue.length) return;
    
    this.currentIndex = index;
    await this.play();
  }

  /**
   * 播放当前歌曲
   */
  async play(): Promise<void> {
    const currentSong = this.getCurrentSong();
    if (!currentSong) return;

    try {
      this.setState(PlayState.LOADING);

      // 如果当前有播放的音频，先停止
      if (this.howl) {
        this.howl.stop();
        this.howl.unload();
      }

      // 尝试从缓存获取音频
      let audioUrl = currentSong.url;
      const cachedBlob = await audioCacheManager.getCachedAudio(currentSong.url);
      
      if (cachedBlob) {
        audioUrl = URL.createObjectURL(cachedBlob);
        console.log('使用缓存的音频文件:', currentSong.title);
      } else {
        console.log('从网络加载音频文件:', currentSong.title);
      }

      // 创建新的Howl实例
      this.howl = new Howl({
        src: [audioUrl],
        html5: true, // 使用HTML5音频以支持流式播放
        preload: true,
        volume: this.muted ? 0 : this.volume,
        onload: () => {
          this.setState(PlayState.PLAYING);
          this.events.onLoad?.();
          this.events.onPlay?.(currentSong);
          this.startProgressTimer();
          
          // 如果不是从缓存加载的，则缓存音频文件
          if (!cachedBlob) {
            this.cacheCurrentAudio(currentSong);
          }
        },
        onloaderror: (id, error) => {
          console.error('音频加载失败:', error);
          this.setState(PlayState.ERROR);
          this.events.onLoadError?.(error);
        },
        onplay: () => {
          this.setState(PlayState.PLAYING);
          this.startProgressTimer();
        },
        onpause: () => {
          this.setState(PlayState.PAUSED);
          this.stopProgressTimer();
          this.events.onPause?.();
        },
        onstop: () => {
          this.setState(PlayState.STOPPED);
          this.stopProgressTimer();
          this.events.onStop?.();
        },
        onend: () => {
          this.setState(PlayState.STOPPED);
          this.stopProgressTimer();
          this.events.onEnd?.();
          this.handleSongEnd();
        }
      });

      this.howl.play();
      this.events.onSongChange?.(currentSong);

    } catch (error) {
      console.error('播放失败:', error);
      this.setState(PlayState.ERROR);
      this.events.onLoadError?.(error);
    }
  }

  /**
   * 缓存当前音频文件
   */
  private async cacheCurrentAudio(song: Song): Promise<void> {
    try {
      const response = await fetch(song.url);
      const blob = await response.blob();
      
      await audioCacheManager.cacheAudio(song.url, blob, {
        title: song.title,
        artist: song.artist,
        duration: song.duration
      });
    } catch (error) {
      console.warn('音频缓存失败:', error);
    }
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.howl && this.state === PlayState.PLAYING) {
      this.howl.pause();
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.howl && this.state === PlayState.PAUSED) {
      this.howl.play();
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.howl) {
      this.howl.stop();
    }
  }

  /**
   * 上一首
   */
  async previous(): Promise<void> {
    let nextIndex = this.currentIndex - 1;
    
    if (nextIndex < 0) {
      if (this.playMode === PlayMode.LOOP) {
        nextIndex = this.queue.length - 1;
      } else {
        return; // 已经是第一首
      }
    }

    this.currentIndex = nextIndex;
    await this.play();
  }

  /**
   * 下一首
   */
  async next(): Promise<void> {
    const nextIndex = this.getNextIndex();
    if (nextIndex !== -1) {
      this.currentIndex = nextIndex;
      await this.play();
    }
  }

  /**
   * 获取下一首歌曲的索引
   */
  private getNextIndex(): number {
    switch (this.playMode) {
      case PlayMode.SINGLE:
        return this.currentIndex; // 单曲循环
      
      case PlayMode.RANDOM:
        if (this.queue.length <= 1) return this.currentIndex;
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.queue.length);
        } while (randomIndex === this.currentIndex);
        return randomIndex;
      
      case PlayMode.SEQUENCE:
        return this.currentIndex + 1 < this.queue.length ? this.currentIndex + 1 : -1;
      
      case PlayMode.LOOP:
        return this.currentIndex + 1 < this.queue.length ? this.currentIndex + 1 : 0;
      
      default:
        return -1;
    }
  }

  /**
   * 处理歌曲结束
   */
  private async handleSongEnd(): Promise<void> {
    const nextIndex = this.getNextIndex();
    if (nextIndex !== -1) {
      this.currentIndex = nextIndex;
      await this.play();
    }
  }

  /**
   * 设置播放模式
   */
  setPlayMode(mode: PlayMode): void {
    this.playMode = mode;
    this.events.onModeChange?.(mode);
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.muted ? 0 : this.volume);
    if (this.howl) {
      this.howl.volume(this.muted ? 0 : this.volume);
    }
    this.events.onVolumeChange?.(this.volume);
  }

  /**
   * 静音/取消静音
   */
  toggleMute(): void {
    this.muted = !this.muted;
    const actualVolume = this.muted ? 0 : this.volume;
    Howler.volume(actualVolume);
    if (this.howl) {
      this.howl.volume(actualVolume);
    }
    this.events.onVolumeChange?.(this.volume);
  }

  /**
   * 设置播放进度
   */
  seek(position: number): void {
    if (this.howl && this.howl.playing()) {
      const duration = this.howl.duration();
      const seekTime = Math.max(0, Math.min(duration, position));
      this.howl.seek(seekTime);
    }
  }

  /**
   * 获取播放进度
   */
  getProgress(): number {
    if (this.howl && this.howl.playing()) {
      return this.howl.seek() as number || 0;
    }
    return 0;
  }

  /**
   * 获取音频总时长
   */
  getDuration(): number {
    if (this.howl) {
      return this.howl.duration() || 0;
    }
    return 0;
  }

  /**
   * 设置播放器状态
   */
  private setState(state: PlayState): void {
    this.state = state;
  }

  /**
   * 开始进度计时器
   */
  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimer = window.setInterval(() => {
      if (this.howl && this.state === PlayState.PLAYING) {
        const progress = this.getProgress();
        const duration = this.getDuration();
        this.events.onProgress?.(progress, duration);
      }
    }, 1000);
  }

  /**
   * 停止进度计时器
   */
  private stopProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    this.stop();
    this.stopProgressTimer();
    
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }

    // 清理预加载的音频
    this.preloadedSongs.forEach(howl => howl.unload());
    this.preloadedSongs.clear();
  }
}

export default AudioPlayer;
