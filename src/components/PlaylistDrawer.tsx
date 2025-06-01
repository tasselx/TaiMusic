import React, { useState, useEffect } from 'react';
import { DEFAULT_COVER } from '../constants';
import { formatDuration } from '../utils';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import CachedImage from './CachedImage';

/**
 * 播放列表组件
 * 显示用户的播放队列和历史记录
 */
interface PlaylistDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}



const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isVisible, onClose }) => {
  const [visible, setVisible] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);

  // 从音频播放器状态管理获取数据
  const {
    queue,
    currentSong,
    play,
    removeFromQueue,
    clearQueue,
    addToFavorites,
    isFavorite
  } = useAudioPlayerStore();

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setIsClosing(false);
    } else if (visible) {
      // 开始关闭动画
      setIsClosing(true);
      // 动画结束后隐藏组件
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300); // 动画持续时间

      return () => clearTimeout(timer);
    }
  }, [isVisible, visible]);

  // 如果不可见且没有正在关闭，则不渲染
  if (!visible) return null;

  // 处理关闭
  const handleClose = () => {
    onClose();
  };

  // 处理点击遮罩层关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div
        className={`recently-played-overlay ${isClosing ? 'closing' : ''}`}
        onClick={handleOverlayClick}
      ></div>
      <div className={`recently-played-container ${isClosing ? 'closing' : ''}`}>
        <div className="recently-played-header">
          <div className="playlist-header-info">
            <h2 className="section-title">播放列表</h2>
            <span className="playlist-count">{queue.length}</span>
          </div>
          <div className="recently-played-actions">
            <button
              className="playlist-action-btn"
              onClick={() => {
                // 收藏所有歌曲
                queue.forEach(song => {
                  if (!isFavorite(song.id)) {
                    addToFavorites(song);
                  }
                });
              }}
              disabled={queue.length === 0}
            >
              <i className="fas fa-heart"></i>
              收藏全部
            </button>
            <button
              className="playlist-action-btn"
              onClick={() => {
                if (window.confirm('确定要清空播放列表吗？')) {
                  clearQueue();
                }
              }}
              disabled={queue.length === 0}
            >
              <i className="fas fa-trash"></i>
              清空
            </button>
            <button className="recently-played-close-btn" onClick={handleClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="playlist-content">
          {queue.length > 0 ? (
            queue.map((song, index) => (
              <div
                key={song.id}
                className={`playlist-song-item ${currentSong?.id === song.id ? 'current-playing' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  play(song);
                }}
              >
                <div className="song-cover-container">
                  <CachedImage
                    src={song.coverUrl || DEFAULT_COVER}
                    className="playlist-song-cover"
                    alt={song.title}
                  />
                  <div className="song-play-overlay">
                    <i className={`fas ${currentSong?.id === song.id ? 'fa-pause' : 'fa-play'}`}></i>
                  </div>
                </div>
                <div className="song-info">
                  <div className="song-main-info">
                    <span className="playlist-song-title">{song.title}</span>
                    <div className="song-meta">
                      <span className="song-quality">{song.quality || 'SQ'}</span>
                      <span className="playlist-song-artist">{song.artist}</span>
                    </div>
                  </div>
                  <div className="playlist-song-duration">
                    {formatDuration(typeof song.duration === 'string' ? song.duration : song.duration || 0)}
                  </div>
                  <div className="song-actions">
                    <button
                      className="song-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite(song.id)) {
                          // TODO: 从收藏移除
                        } else {
                          addToFavorites(song);
                        }
                      }}
                      title={isFavorite(song.id) ? '取消收藏' : '收藏'}
                    >
                      <i className={`fas ${isFavorite(song.id) ? 'fa-heart' : 'fa-heart-o'}`}></i>
                    </button>
                    <button
                      className="song-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`确定要从播放列表移除 "${song.title}" 吗？`)) {
                          removeFromQueue(index);
                        }
                      }}
                      title="从列表移除"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="playlist-empty">
              <div className="empty-icon">
                <i className="fas fa-music"></i>
              </div>
              <p className="empty-text">播放列表为空</p>
              <p className="empty-subtext">开始播放音乐，歌曲将会出现在这里</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistDrawer;
