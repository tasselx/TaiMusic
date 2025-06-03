import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { PlayMode } from '../utils/audioPlayer';
import { formatDuration } from '../utils';
import { getPlayerCoverClassName } from '../utils/coverAnimation';
import { formatCoverUrlByUsage } from '../utils/formatters';
import { extractColorThemeFromImage, ColorTheme } from '../utils/colorExtractor';

interface FullScreenPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 全屏播放器组件
 * 提供沉浸式的音乐播放体验，包含大尺寸专辑封面、完整控制按钮和预留歌词显示区域
 */
const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ isVisible, onClose }) => {
  // 从音频播放器状态管理获取状态和方法
  const {
    currentSong,
    isPlaying,
    isPaused,
    isLoading,
    volume,
    muted,
    playMode,
    progress,
    duration,
    play,
    pause,
    resume,
    next,
    previous,
    setVolume,
    toggleMute,
    setPlayMode,
    seek
  } = useAudioPlayerStore();

  // 颜色主题状态
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null);
  const [isExtractingColor, setIsExtractingColor] = useState(false);

  // 切换播放/暂停
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      await play();
    }
  }, [isPlaying, isPaused, pause, resume, play]);

  // 切换播放模式
  const togglePlayMode = useCallback(() => {
    const modes = [PlayMode.SEQUENCE, PlayMode.LOOP, PlayMode.SINGLE, PlayMode.RANDOM];
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  }, [playMode, setPlayMode]);

  // 获取播放模式图标
  const getPlayModeIcon = () => {
    switch (playMode) {
      case PlayMode.SEQUENCE:
        return 'fa-list-ol';
      case PlayMode.LOOP:
        return 'fa-redo';
      case PlayMode.SINGLE:
        return 'fa-redo-alt';
      case PlayMode.RANDOM:
        return 'fa-random';
      default:
        return 'fa-list-ol';
    }
  };

  // 获取播放模式名称
  const getPlayModeName = () => {
    switch (playMode) {
      case PlayMode.SEQUENCE:
        return '顺序播放';
      case PlayMode.LOOP:
        return '列表循环';
      case PlayMode.SINGLE:
        return '单曲循环';
      case PlayMode.RANDOM:
        return '随机播放';
      default:
        return '顺序播放';
    }
  };

  // 处理进度条拖拽
  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    seek(newProgress);
  }, [seek]);

  // 处理音量调节
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
  }, [setVolume]);

  // 提取封面颜色主题
  const extractCoverColors = useCallback(async (coverUrl: string) => {
    if (!coverUrl || isExtractingColor) return;

    setIsExtractingColor(true);
    try {
      const theme = await extractColorThemeFromImage(coverUrl);
      setColorTheme(theme);
    } catch (error) {
      console.error('提取封面颜色失败:', error);
      setColorTheme(null);
    } finally {
      setIsExtractingColor(false);
    }
  }, [isExtractingColor]);

  // 默认歌曲信息
  const defaultSong = {
    title: "星空漫游",
    artist: "陈思琪",
    coverUrl: "https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg"
  };

  // 当前显示的歌曲信息
  const displaySong = currentSong || defaultSong;

  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previous();
        break;
      case 'ArrowRight':
        e.preventDefault();
        next();
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;
    }
  }, [isVisible, togglePlay, previous, next, onClose, toggleMute]);

  // 监听封面变化，提取颜色主题
  useEffect(() => {
    if (isVisible && displaySong) {
      const coverUrl = formatCoverUrlByUsage(
        displaySong.coverUrl || (displaySong as any).imageUrl,
        'fullscreen'
      );
      if (coverUrl) {
        extractCoverColors(coverUrl);
      }
    }
  }, [isVisible, displaySong, extractCoverColors]);

  // 注册键盘事件监听
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // 阻止页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVisible, handleKeyDown]);

  // 格式化封面URL为全屏尺寸
  const fullScreenCoverUrl = formatCoverUrlByUsage(
    displaySong.coverUrl || (displaySong as any).imageUrl,
    'fullscreen'
  );

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fullscreen-player ${isVisible ? 'visible' : ''}`}
      style={{
        '--dynamic-bg': colorTheme?.backgroundGradient || 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7))',
        '--dynamic-text': colorTheme?.textColor || '#ffffff',
        '--dynamic-primary': colorTheme?.primary.hex || '#4a90e2'
      } as React.CSSProperties}
    >
      {/* 毛玻璃背景 */}
      <div
        className="fullscreen-player-backdrop"
        onClick={onClose}
        style={{
          background: colorTheme?.backgroundGradient || 'rgba(0, 0, 0, 0.8)'
        }}
      />
      
      {/* 主要内容区域 */}
      <div className="fullscreen-player-content">
        {/* 头部控制栏 */}
        <div className="fullscreen-player-header">
          <button className="fullscreen-close-btn" onClick={onClose}>
            <i className="fas fa-chevron-down"></i>
          </button>
          <div className="fullscreen-player-title">正在播放</div>
          <div className="fullscreen-player-actions">
            {/* 预留更多操作按钮位置 */}
          </div>
        </div>

        {/* 专辑封面区域 */}
        <div className="fullscreen-cover-container">
          <div className={getPlayerCoverClassName(!!currentSong, isPlaying, "fullscreen-cover")}>
            <img
              src={fullScreenCoverUrl}
              className="fullscreen-cover-image"
              alt={displaySong.title}
            />
          </div>
        </div>

        {/* 歌曲信息区域 */}
        <div className="fullscreen-song-info">
          <h1 className="fullscreen-song-title">{displaySong.title}</h1>
          <p className="fullscreen-song-artist">{displaySong.artist}</p>
        </div>

        {/* 歌词区域（预留） */}
        <div className="fullscreen-lyrics-container">
          <div className="fullscreen-lyrics-placeholder">
            <i className="fas fa-music"></i>
            <p>歌词功能即将推出</p>
          </div>
        </div>

        {/* 进度控制区域 */}
        <div className="fullscreen-progress-section">
          <div className="fullscreen-progress-container">
            <span className="fullscreen-time">{formatDuration(progress)}</span>
            <input
              type="range"
              className="fullscreen-progress-bar"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleProgressChange}
            />
            <span className="fullscreen-time">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* 播放控制区域 */}
        <div className="fullscreen-controls">
          <div className="fullscreen-control-buttons">
            <button
              className="fullscreen-control-btn"
              onClick={togglePlayMode}
              title={getPlayModeName()}
            >
              <i className={`fas ${getPlayModeIcon()}`}></i>
            </button>
            
            <button className="fullscreen-control-btn" onClick={previous}>
              <i className="fas fa-step-backward"></i>
            </button>
            
            <button
              className={`fullscreen-play-btn ${isLoading ? 'loading' : ''}`}
              onClick={isLoading ? undefined : togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              )}
            </button>
            
            <button className="fullscreen-control-btn" onClick={next}>
              <i className="fas fa-step-forward"></i>
            </button>
            
            <button className="fullscreen-control-btn">
              <i className="fas fa-heart"></i>
            </button>
          </div>

          {/* 音量控制 */}
          <div className="fullscreen-volume-section">
            <button
              className="fullscreen-volume-btn"
              onClick={toggleMute}
              title={muted ? '取消静音' : '静音'}
            >
              <i className={`fas ${muted ? 'fa-volume-mute' : volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down'}`}></i>
            </button>
            <input
              type="range"
              className="fullscreen-volume-slider"
              min="0"
              max="100"
              value={muted ? 0 : volume * 100}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FullScreenPlayer;
