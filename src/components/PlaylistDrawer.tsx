import React, { useState, useEffect } from 'react';
import { DEFAULT_COVER } from '../constants';
import { formatDuration } from '../utils';
import CachedImage from './CachedImage';

/**
 * 播放列表组件
 * 显示用户的播放队列和历史记录
 */
interface PlaylistDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

// 模拟数据 - 实际应用中应从状态管理或API获取
const playlistData = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    imageUrl: DEFAULT_COVER
  },
  {
    id: 2,
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "3:53",
    imageUrl: DEFAULT_COVER
  },
  {
    id: 3,
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    duration: "3:29",
    imageUrl: DEFAULT_COVER
  },
  {
    id: 4,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    imageUrl: DEFAULT_COVER
  },
  {
    id: 5,
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:03",
    imageUrl: DEFAULT_COVER
  }
];

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isVisible, onClose }) => {
  const [visible, setVisible] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);

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
            <span className="playlist-count">{playlistData.length}</span>
          </div>
          <div className="recently-played-actions">
            <button className="playlist-action-btn">
              <i className="fas fa-heart"></i>
              收藏全部
            </button>
            <button className="playlist-action-btn">
              <i className="fas fa-trash"></i>
              清空
            </button>
            <button className="recently-played-close-btn" onClick={handleClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="playlist-content">
          {playlistData.length > 0 ? (
            playlistData.map((song, index) => (
              <div
                key={song.id}
                className="playlist-song-item"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  // TODO: 实现播放功能
                  console.log('播放歌曲:', song.title);
                }}
              >
                <div className="song-cover-container">
                  <CachedImage
                    src={song.imageUrl}
                    className="playlist-song-cover"
                    alt={song.title}
                  />
                  <div className="song-play-overlay">
                    <i className="fas fa-play"></i>
                  </div>
                </div>
                <div className="song-info">
                  <div className="song-main-info">
                    <span className="playlist-song-title">{song.title}</span>
                    <div className="song-meta">
                      <span className="song-quality">SQ</span>
                      <span className="playlist-song-artist">{song.artist}</span>
                    </div>
                  </div>
                  <div className="playlist-song-duration">{formatDuration(song.duration)}</div>
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
