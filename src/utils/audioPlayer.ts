/**
 * 音频播放器核心类
 * 基于Howler.js实现的功能完备的音频播放器，支持缓存、队列管理等功能
 */
import { Howl, Howler } from 'howler';
import { audioCacheManager } from './audioCacheManager';
import { audioPlayerDebugger } from './audioPlayerDebugger';

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
    this.validateAudioContext();
  }

  /**
   * 验证音频上下文是否可用
   */
  private validateAudioContext(): boolean {
    try {
      if (typeof window === 'undefined') {
        console.warn('AudioPlayer: 运行在非浏览器环境中');
        return false;
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.error('AudioPlayer: 浏览器不支持音频上下文');
        return false;
      }

      console.log('AudioPlayer: 音频上下文验证通过');
      return true;
    } catch (error) {
      console.error('AudioPlayer: 音频上下文验证失败:', error);
      return false;
    }
  }

  /**
   * 激活音频上下文（需要用户交互）
   */
  private async activateAudioContext(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        return false;
      }

      // 检查Howler的音频上下文状态
      const ctx = Howler.ctx;
      if (ctx && ctx.state === 'suspended') {
        console.log('AudioPlayer: 尝试激活音频上下文...');
        await ctx.resume();
        console.log('AudioPlayer: 音频上下文已激活，状态:', ctx.state);
      }

      return true;
    } catch (error) {
      console.error('AudioPlayer: 音频上下文激活失败:', error);
      return false;
    }
  }

  /**
   * 检查播放器是否准备就绪
   */
  isReady(): boolean {
    return this.validateAudioContext() && this.state !== PlayState.ERROR;
  }

  /**
   * 确保音频上下文已激活并准备播放
   */
  async ensureAudioContextReady(): Promise<boolean> {
    try {
      // 首先验证音频上下文支持
      if (!this.validateAudioContext()) {
        return false;
      }

      // 尝试激活音频上下文
      const activated = await this.activateAudioContext();
      if (!activated) {
        console.error('AudioPlayer: 音频上下文激活失败');
        return false;
      }

      console.log('AudioPlayer: 音频上下文准备就绪');
      return true;
    } catch (error) {
      console.error('AudioPlayer: 音频上下文准备失败:', error);
      return false;
    }
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

    // 如果队列为空，停止播放并重置状态
    if (this.queue.length === 0) {
      this.stop();
      this.currentIndex = -1;
      this.events.onQueueChange?.(this.queue);
      this.events.onSongChange?.(null);
      return;
    }

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

    // 检查播放器是否准备就绪
    if (!this.isReady()) {
      console.error('AudioPlayer: 播放器未准备就绪');
      this.setState(PlayState.ERROR);
      this.events.onLoadError?.('播放器未准备就绪');
      return;
    }

    // 确保音频上下文已激活
    const audioContextReady = await this.ensureAudioContextReady();
    if (!audioContextReady) {
      console.error('AudioPlayer: 音频上下文未激活，无法播放');
      this.setState(PlayState.ERROR);
      this.events.onLoadError?.('音频上下文未激活，请重试播放');
      return;
    }

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
          console.log('AudioPlayer: 音频文件加载完成，准备播放');
          // 音频加载完成后再次确保音频上下文激活
          this.ensureAudioContextReady().then((ready) => {
            if (ready) {
              // 开始播放
              if (this.howl) {
                const playPromise = this.howl.play();
                // 处理播放Promise（某些浏览器返回Promise）
                if (playPromise && typeof playPromise.catch === 'function') {
                  playPromise.catch((error) => {
                    console.error('AudioPlayer: 播放启动失败:', error);
                    audioPlayerDebugger.addError(`播放启动失败: ${error}`);
                    this.setState(PlayState.ERROR);
                    this.events.onLoadError?.(error);
                  });
                }
              }
            } else {
              console.error('AudioPlayer: 音频上下文未激活，无法开始播放');
              this.setState(PlayState.ERROR);
              this.events.onLoadError?.('音频上下文未激活');
            }
          });

          this.events.onLoad?.();

          // 如果不是从缓存加载的，则缓存音频文件
          if (!cachedBlob) {
            this.cacheCurrentAudio(currentSong);
          }
        },
        onloaderror: (id, error) => {
          console.error('音频加载失败:', error);
          audioPlayerDebugger.addError(`音频加载失败: ${error}`);
          this.setState(PlayState.ERROR);
          this.events.onLoadError?.(error);
        },
        onplay: () => {
          console.log('AudioPlayer: 音频开始播放');
          this.setState(PlayState.PLAYING);
          this.events.onPlay?.(currentSong);
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
          // 歌曲结束时，确保进度显示为完整时长
          const duration = this.getDuration();
          if (duration > 0) {
            this.events.onProgress?.(duration, duration);
          }

          // 检查是否需要继续播放
          const nextIndex = this.getNextIndex();
          const willContinuePlaying = nextIndex !== -1;

          if (!willContinuePlaying) {
            // 只有在不会继续播放时才设置为停止状态
            this.setState(PlayState.STOPPED);
          }

          this.stopProgressTimer();
          this.events.onEnd?.();
          this.handleSongEnd();
        }
      });

      // 不在这里直接调用play()，而是等待onload事件
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
    // 如果队列为空，直接返回
    if (this.queue.length === 0) return;

    // 如果只有一首歌，根据播放模式处理
    if (this.queue.length === 1) {
      switch (this.playMode) {
        case PlayMode.SINGLE:
        case PlayMode.LOOP:
        case PlayMode.RANDOM:
          // 重新播放当前歌曲
          await this.play();
          return;
        case PlayMode.SEQUENCE:
          // 顺序播放模式下，只有一首歌时重新播放
          await this.play();
          return;
      }
    }

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
    // 如果队列为空，直接返回
    if (this.queue.length === 0) return;

    // 如果只有一首歌，根据播放模式处理
    if (this.queue.length === 1) {
      switch (this.playMode) {
        case PlayMode.SINGLE:
        case PlayMode.LOOP:
        case PlayMode.RANDOM:
          // 重新播放当前歌曲
          await this.play();
          return;
        case PlayMode.SEQUENCE:
          // 顺序播放模式下，手动点击下一首时重新播放
          await this.play();
          return;
      }
    }

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
    // 如果队列为空，返回-1
    if (this.queue.length === 0) return -1;

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
        // 顺序播放：如果只有一首歌，停止播放；否则播放下一首
        if (this.queue.length === 1) return -1; // 只有一首歌时停止
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
      // 如果下一首是当前歌曲（单曲循环等情况），保持播放状态
      const willReplaySameSong = nextIndex === this.currentIndex;

      if (willReplaySameSong) {
        // 单曲循环时，保持播放状态，避免界面闪烁
        this.setState(PlayState.LOADING);
      }

      this.currentIndex = nextIndex;
      await this.play();
    } else {
      // 没有下一首歌曲时，确保状态为停止
      this.setState(PlayState.STOPPED);
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

        // 检查是否接近结束（剩余时间小于0.5秒）
        if (duration > 0 && (duration - progress) < 0.5) {
          // 更频繁地检查，确保能及时捕获结束
          setTimeout(() => {
            if (this.howl && this.state === PlayState.PLAYING) {
              const finalProgress = this.getProgress();
              const finalDuration = this.getDuration();
              this.events.onProgress?.(finalProgress, finalDuration);
            }
          }, 100);
        }
      }
    }, 250); // 提高更新频率到250ms，提供更流畅的进度显示
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
