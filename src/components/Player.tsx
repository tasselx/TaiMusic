import React, { useState, useEffect } from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { PlayMode } from '../utils/audioPlayer';
import { formatDuration } from '../utils';
import PlaylistDrawer from './PlaylistDrawer';
import FullScreenPlayer from './FullScreenPlayer';
import { getPlayerCoverClassName } from '../utils/coverAnimation';

/**
 * 使用新音频播放器的播放器组件
 */
const Player: React.FC = () => {
  // 从新的音频播放器状态管理获取状态和方法
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
    seek,
    initializePlayer
  } = useAudioPlayerStore();

  // 播放列表显示状态
  const [showPlaylist, setShowPlaylist] = useState(false);

  // 全屏播放器显示状态
  const [showFullScreen, setShowFullScreen] = useState(false);

  // 初始化播放器
  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  // 切换播放列表显示状态
  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  // 打开全屏播放器
  const openFullScreen = () => {
    setShowFullScreen(true);
  };

  // 关闭全屏播放器
  const closeFullScreen = () => {
    setShowFullScreen(false);
  };

  // 处理可点击区域的点击事件
  const handleClickableAreaClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发其他点击事件
    e.stopPropagation();
    openFullScreen();
  };

  // 切换播放/暂停
  const togglePlay = async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      // play方法内部已包含初始化检查
      await play();
    }
  };

  // 切换播放模式
  const togglePlayMode = () => {
    const modes = [PlayMode.SEQUENCE, PlayMode.LOOP, PlayMode.SINGLE, PlayMode.RANDOM];
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

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

  // 处理进度条拖拽
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    seek(newProgress);
  };

  // 处理音量调节
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
  };

  // 默认歌曲信息
  const defaultSong = {
    title: "星空漫游",
    artist: "陈思琪",
    coverUrl: "https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg"
  };

  // 当前显示的歌曲信息
  const displaySong = currentSong || defaultSong;

  return (
    <footer className="player">
      <div className="now-playing" onClick={handleClickableAreaClick}>
        <div className={getPlayerCoverClassName(!!currentSong, isPlaying, "now-playing-disc")}>
          <img
            src={displaySong.coverUrl || (displaySong as any).imageUrl}
            className="cover-image"
            alt={displaySong.title}
          />
        </div>
        <div className="now-playing-info">
          <h4>{displaySong.title}</h4>
          <p>{displaySong.artist}</p>
        </div>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <div
            className="player-button"
            onClick={togglePlayMode}
            title={`播放模式: ${playMode}`}
          >
            <i className={`fas ${getPlayModeIcon()}`}></i>
          </div>
          <div className="player-button" onClick={previous}>
            <i className="fas fa-step-backward"></i>
          </div>
          <div
            className={`play-button ${isLoading ? 'loading' : ''}`}
            onClick={isLoading ? undefined : togglePlay}
            style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            )}
          </div>
          <div className="player-button" onClick={next}>
            <i className="fas fa-step-forward"></i>
          </div>
          <div className="player-button">
            <i className="fas fa-heart"></i>
          </div>
        </div>
        <div className="progress-container">
          <span className="time">{formatDuration(progress)}</span>
          <input
            type="range"
            className="progress-bar"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
          />
          <span className="time">{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="player-options">
        <div
          className="player-button"
          onClick={toggleMute}
          title={muted ? '取消静音' : '静音'}
        >
          <i className={`fas ${muted ? 'fa-volume-mute' : volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down'}`}></i>
        </div>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={muted ? 0 : volume * 100}
          onChange={handleVolumeChange}
        />
        <div
          className={`player-button toggle-recently-played ${showPlaylist ? 'active' : ''}`}
          onClick={togglePlaylist}
        >
          <i className="fas fa-list"></i>
        </div>
      </div>

      {/* 播放列表组件 */}
      <PlaylistDrawer
        isVisible={showPlaylist}
        onClose={() => setShowPlaylist(false)}
      />

      {/* 全屏播放器组件 */}
      <FullScreenPlayer
        isVisible={showFullScreen}
        onClose={closeFullScreen}
      />
    </footer>
  );
};

export default Player;
