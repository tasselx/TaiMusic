import React, { useState, useEffect } from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import PlaylistSongItem from './PlaylistSongItem';

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
                // 直接清空播放列表，无需确认
                clearQueue();
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
              <PlaylistSongItem
                key={song.id}
                song={song}
                index={index}
                onPlay={play}
                onRemove={removeFromQueue}
              />
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
