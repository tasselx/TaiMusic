/**
 * 音频播放器调试工具
 * 用于诊断首次播放失败的问题
 */
import { Howler } from 'howler';

export interface AudioDebugInfo {
  // 浏览器信息
  userAgent: string;
  browserName: string;
  
  // 音频上下文信息
  audioContextSupported: boolean;
  audioContextState: string | null;
  audioContextSampleRate: number | null;
  
  // Howler信息
  howlerVersion: string;
  howlerCodecSupported: {
    mp3: boolean;
    mpeg: boolean;
    opus: boolean;
    ogg: boolean;
    oga: boolean;
    wav: boolean;
    aac: boolean;
    caf: boolean;
    m4a: boolean;
    mp4: boolean;
    weba: boolean;
    webm: boolean;
    dolby: boolean;
    flac: boolean;
  };
  
  // 自动播放策略
  autoplayAllowed: boolean | null;
  
  // 用户交互状态
  hasUserInteracted: boolean;
  
  // 错误信息
  errors: string[];
}

class AudioPlayerDebugger {
  private hasUserInteracted = false;
  private errors: string[] = [];

  constructor() {
    this.setupUserInteractionTracking();
  }

  /**
   * 设置用户交互跟踪
   */
  private setupUserInteractionTracking(): void {
    if (typeof window !== 'undefined') {
      const markInteraction = () => {
        this.hasUserInteracted = true;
        console.log('AudioPlayerDebugger: 用户已交互');
      };

      // 监听各种用户交互事件
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, markInteraction, { once: true, passive: true });
      });
    }
  }

  /**
   * 检测浏览器名称
   */
  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'Unknown';
    
    const userAgent = window.navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  /**
   * 检查音频上下文支持
   */
  private checkAudioContextSupport(): {
    supported: boolean;
    state: string | null;
    sampleRate: number | null;
  } {
    try {
      if (typeof window === 'undefined') {
        return { supported: false, state: null, sampleRate: null };
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        return { supported: false, state: null, sampleRate: null };
      }

      // 检查Howler的音频上下文
      const ctx = Howler.ctx;
      if (ctx) {
        return {
          supported: true,
          state: ctx.state,
          sampleRate: ctx.sampleRate
        };
      }

      return { supported: true, state: null, sampleRate: null };
    } catch (error) {
      this.errors.push(`音频上下文检查失败: ${error}`);
      return { supported: false, state: null, sampleRate: null };
    }
  }

  /**
   * 检查自动播放策略
   */
  private async checkAutoplayPolicy(): Promise<boolean | null> {
    try {
      if (typeof window === 'undefined') return null;

      // 创建一个静音的音频元素来测试自动播放
      const audio = document.createElement('audio');
      audio.muted = true;
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      try {
        await audio.play();
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      this.errors.push(`自动播放策略检查失败: ${error}`);
      return null;
    }
  }

  /**
   * 获取完整的调试信息
   */
  async getDebugInfo(): Promise<AudioDebugInfo> {
    const audioContextInfo = this.checkAudioContextSupport();
    const autoplayAllowed = await this.checkAutoplayPolicy();

    return {
      // 浏览器信息
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      browserName: this.detectBrowser(),
      
      // 音频上下文信息
      audioContextSupported: audioContextInfo.supported,
      audioContextState: audioContextInfo.state,
      audioContextSampleRate: audioContextInfo.sampleRate,
      
      // Howler信息
      howlerVersion: Howler.version || 'Unknown',
      howlerCodecSupported: {
        mp3: Howler.codecs('mp3'),
        mpeg: Howler.codecs('mpeg'),
        opus: Howler.codecs('opus'),
        ogg: Howler.codecs('ogg'),
        oga: Howler.codecs('oga'),
        wav: Howler.codecs('wav'),
        aac: Howler.codecs('aac'),
        caf: Howler.codecs('caf'),
        m4a: Howler.codecs('m4a'),
        mp4: Howler.codecs('mp4'),
        weba: Howler.codecs('weba'),
        webm: Howler.codecs('webm'),
        dolby: Howler.codecs('dolby'),
        flac: Howler.codecs('flac')
      },
      
      // 自动播放策略
      autoplayAllowed,
      
      // 用户交互状态
      hasUserInteracted: this.hasUserInteracted,
      
      // 错误信息
      errors: [...this.errors]
    };
  }

  /**
   * 打印调试信息到控制台
   */
  async printDebugInfo(): Promise<void> {
    const info = await this.getDebugInfo();
    
    console.group('🎵 音频播放器调试信息');
    
    console.group('📱 浏览器信息');
    console.log('浏览器:', info.browserName);
    console.log('User Agent:', info.userAgent);
    console.groupEnd();
    
    console.group('🔊 音频上下文');
    console.log('支持:', info.audioContextSupported ? '✅' : '❌');
    console.log('状态:', info.audioContextState || '未知');
    console.log('采样率:', info.audioContextSampleRate || '未知');
    console.groupEnd();
    
    console.group('🎶 Howler.js');
    console.log('版本:', info.howlerVersion);
    console.log('编解码器支持:');
    Object.entries(info.howlerCodecSupported).forEach(([codec, supported]) => {
      console.log(`  ${codec}:`, supported ? '✅' : '❌');
    });
    console.groupEnd();
    
    console.group('🎮 用户交互');
    console.log('自动播放允许:', info.autoplayAllowed === null ? '未知' : (info.autoplayAllowed ? '✅' : '❌'));
    console.log('用户已交互:', info.hasUserInteracted ? '✅' : '❌');
    console.groupEnd();
    
    if (info.errors.length > 0) {
      console.group('❌ 错误信息');
      info.errors.forEach(error => console.error(error));
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * 添加错误信息
   */
  addError(error: string): void {
    this.errors.push(error);
  }

  /**
   * 清除错误信息
   */
  clearErrors(): void {
    this.errors = [];
  }
}

// 创建全局调试器实例
export const audioPlayerDebugger = new AudioPlayerDebugger();

// 在开发环境下自动打印调试信息
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟打印，确保页面加载完成
  setTimeout(() => {
    audioPlayerDebugger.printDebugInfo();
  }, 2000);
}

export default AudioPlayerDebugger;
