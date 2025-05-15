import { useEffect, useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import './components.scss';

export const Player = () => {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  
  // 从store获取状态和方法
  const { currentSong, isPlaying, playSong, pauseSong } = useMusicStore();
  
  const togglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else if (currentSong) {
      playSong(currentSong);
    }
  };
  
  // 模拟播放进度
  useEffect(() => {
    let interval: number | undefined = undefined;
    
    if (isPlaying && currentSong) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            window.clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, currentSong.duration * 10); // 加快进度，便于演示
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying, currentSong]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 计算当前时间
  const calculateCurrentTime = () => {
    if (!currentSong) return '0:00';
    return formatTime((currentSong.duration * progress) / 100);
  };

  if (!currentSong) {
    return (
      <div className="flex-center h-full text-gray">
        <p>没有正在播放的歌曲</p>
      </div>
    );
  }

  return (
    <div className="player">
      {/* Song Info */}
      <div className="player__info">
        <img
          src={currentSong.cover || 'https://via.placeholder.com/60?text=Cover'}
          className="player__cover"
          alt={currentSong.title}
        />
        <div className="player__details">
          <p className="player__title">
            {currentSong.title}
          </p>
          <p className="player__artist">
            {currentSong.artist} - {currentSong.album}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="player__controls">
        <div className="player__buttons">
          {/* Shuffle Button */}
          <button
            className="player-button mr-2"
            aria-label="Shuffle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          </button>
          
          {/* Previous Button */}
          <button
            className="player-button mx-1"
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20l-10-8 10-8v16zM5 19V5" />
            </svg>
          </button>
          
          {/* Play/Pause Button */}
          <button
            className="player-button player-button--play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="currentColor" strokeWidth={2} />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="currentColor" strokeWidth={2} />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="currentColor" strokeWidth={2} />
              </svg>
            )}
          </button>
          
          {/* Next Button */}
          <button
            className="player-button mx-1"
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4l10 8-10 8V4zM19 5v14" />
            </svg>
          </button>
          
          {/* Repeat Button */}
          <button
            className="player-button ml-2"
            aria-label="Repeat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 1l4 4-4 4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11V9a4 4 0 014-4h14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 23l-4-4 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
          </button>
        </div>

        <div className="flex items-center w-full">
          <span className="w-[40px] text-xs text-gray text-right">
            {calculateCurrentTime()}
          </span>
          
          {/* Progress Slider */}
          <div className="progress-bar">
            <div 
              className="progress-bar__fill" 
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="progress-bar__handle"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          
          <span className="w-[40px] text-xs text-gray">
            {formatTime(currentSong.duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="player__volume">
        <button
          className="player-button"
          aria-label="Volume"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {/* Volume Slider */}
        <div className="progress-bar ml-2" style={{ width: '100px' }}>
          <div 
            className="progress-bar__fill" 
            style={{ width: `${volume}%` }}
          ></div>
          <div 
            className="progress-bar__handle"
            style={{ left: `${volume}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}; 