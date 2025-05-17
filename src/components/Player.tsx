import React from 'react';
import { usePlayerStore } from '../store';

/**
 * 使用Zustand状态管理的播放器组件
 */
const Player: React.FC = () => {
  // 从Zustand获取状态和方法
  const {
    isPlaying,
    currentSong,
    progress,
    volume,
    togglePlay,
    setProgress,
    setVolume,
    next,
    previous
  } = usePlayerStore();

  // 默认歌曲信息
  const defaultSong = {
    title: "星空漫游",
    artist: "陈思琪",
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg"
  };

  // 当前显示的歌曲信息
  const displaySong = currentSong || defaultSong;

  return (
    <footer className="player">
      <div className="now-playing">
        <img
          src={displaySong.imageUrl}
          className="now-playing-image"
          alt={displaySong.title}
        />
        <div className="now-playing-info">
          <h4>{displaySong.title}</h4>
          <p>{displaySong.artist}</p>
        </div>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <div className="player-button">
            <i className="fas fa-random"></i>
          </div>
          <div className="player-button" onClick={previous}>
            <i className="fas fa-step-backward"></i>
          </div>
          <div
            className="play-button"
            onClick={togglePlay}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </div>
          <div className="player-button" onClick={next}>
            <i className="fas fa-step-forward"></i>
          </div>
          <div className="player-button">
            <i className="fas fa-redo"></i>
          </div>
        </div>
        <div className="progress-container">
          <span className="time">02:14</span>
          <input
            type="range"
            className="progress-bar"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
          <span className="time">04:32</span>
        </div>
      </div>

      <div className="player-options">
        <div className="player-button">
          <i className="fas fa-volume-up"></i>
        </div>
        <input
          type="range"
          className="volume-slider"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <div className="player-button">
          <i className="fas fa-list"></i>
        </div>
      </div>
    </footer>
  );
};

export default Player;
