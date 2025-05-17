import React, { useState, useEffect } from 'react';

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
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
  },
  {
    id: 2,
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "3:53",
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
  },
  {
    id: 3,
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    duration: "3:29",
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
  },
  {
    id: 4,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
  },
  {
    id: 5,
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:03",
    imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
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
          <h2 className="section-title">播放列表</h2>
          <div className="recently-played-actions">
            <button className="recently-played-action-btn">
              <i className="fas fa-play"></i> 播放全部
            </button>
            <button className="recently-played-close-btn" onClick={handleClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="song-list">
          <div className="song-list-header">
            <div className="song-number">#</div>
            <div style={{ flex: 1 }}>歌曲标题</div>
            <div className="song-artist">歌手</div>
            <div className="song-album">专辑</div>
            <div className="song-duration">时长</div>
          </div>
          <div className="song-list-body">
            {playlistData.map((song) => (
              <div key={song.id} className="song-item">
                <div className="song-number">{song.id}</div>
                <div className="song-title-container">
                  <img src={song.imageUrl} className="song-image" alt={song.title} />
                  <span className="song-title">{song.title}</span>
                </div>
                <div className="song-artist">{song.artist}</div>
                <div className="song-album">{song.album}</div>
                <div className="song-duration">{song.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaylistDrawer;
