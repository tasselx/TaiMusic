import React, { useEffect, useState } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import SearchBar from './components/SearchBar';
import Player from './components/Player';
import DailyRecommendations from './components/DailyRecommendations';
import CacheManager from './components/CacheManager';
import CachedImage from './components/CachedImage';
import UserDropdown from './components/UserDropdown';
import { DEFAULT_COVER, DAILY_RECOMMEND_COVER } from './constants';
import { formatDuration, formatCoverUrl } from './utils';
import {
  useUIStore,
  useSearchStore,
  useApiStore,
  Song
} from './store';

const App: React.FC = () => {
  // 状态管理
  const [showCacheManager, setShowCacheManager] = useState<boolean>(false);

  // 使用Zustand状态管理
  const { setWindowSize } = useUIStore();
  const { searchTerm, searchResults, setSearchTerm, performSearch } = useSearchStore();
  const { checkApiStatus } = useApiStore();

  const recommendedPlaylists = [
    {
      id: 1,
      title: "电音派对精选",
      plays: "128.5万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/82459f6f89c1f4acce823726b8c34d03.jpg"
    },
    {
      id: 2,
      title: "午后慵懒时光",
      plays: "89.3万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/b3847335758e50880f499a70f3a8952e.jpg"
    },
    {
      id: 3,
      title: "爵士乐精选集",
      plays: "56.8万",
      imageUrl: DAILY_RECOMMEND_COVER
    },
    {
      id: 4,
      title: "复古情歌集",
      plays: "75.2万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/ed10695bb5474de5384df49f900dfd59.jpg"
    },
    {
      id: 5,
      title: "轻音乐精选",
      plays: "92.1万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/326ab5641b3c96cdd380787272b20597.jpg"
    }
  ];

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWindowSize]);

  // 检查API服务状态
  useEffect(() => {
    // 初始化时检查API状态
    checkApiStatus();
  }, [checkApiStatus]);

  // 搜索音乐
  const handleSearch = () => {
    performSearch();
  };

  // 搜索函数已在handleSearch中定义

  // 处理头部点击事件，使搜索框失去焦点
  const handleHeaderClick = () => {
    // 清除任何可能的文本选择
    if (window.getSelection) {
      window.getSelection()?.empty();
    }

    // 使文档中任何具有焦点的元素失去焦点
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // 处理头部双击事件，使搜索框失去焦点并清除选择
  const handleHeaderDoubleClick = () => {
    // 清除任何可能的文本选择
    if (window.getSelection) {
      window.getSelection()?.empty();
    }

    // 使文档中任何具有焦点的元素失去焦点
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="app-container">
      <header
        className="header"
        data-tauri-drag-region
        onClick={handleHeaderClick}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <div className="logo">Tai Music</div>
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            console.log('设置搜索词:', value);
            setSearchTerm(value);
          }}
          onSearch={handleSearch}
        />
        <UserDropdown />
      </header>

      <div className="main-content">
        <nav className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">在线音乐</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-compass"></i>
                  <span>发现音乐</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-podcast"></i>
                  <span>播客</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-video"></i>
                  <span>视频</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">我的音乐</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-heart"></i>
                  <span>我喜欢</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-download"></i>
                  <span>本地与下载</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-item-content">
                  <i className="fas fa-history"></i>
                  <span>最近播放</span>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        <main className="content">
          {/* 搜索结果显示 */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h2 className="section-title">搜索结果</h2>
              <div className="song-list">
                <div className="song-list-header">
                  <div className="song-number">#</div>
                  <div style={{ flex: 1 }}>歌曲标题</div>
                  <div className="song-artist">歌手</div>
                  <div className="song-album">专辑</div>
                  <div className="song-duration">时长</div>
                </div>
                <div className="song-list-body">
                  {searchResults.map((song, index) => (
                    <div key={song.id || index} className="song-item">
                      <div className="song-number">{index + 1}</div>
                      <div className="song-title-container">
                        <CachedImage
                          src={song.sizable_cover ? formatCoverUrl(song.sizable_cover) : (song.pic || DEFAULT_COVER)}
                          className="song-image"
                          alt={song.name}
                        />
                        <span className="song-title search-result-text">{song.name}</span>
                      </div>
                      <div className="song-artist search-result-text">{song.singer}</div>
                      <div className="song-album search-result-text">{song.album}</div>
                      <div className="song-duration">{formatDuration(song.duration)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DailyRecommendations />

          <div>
            <h2 className="section-title">推荐歌单</h2>
            <div className="playlist-grid">
              {recommendedPlaylists.map(playlist => (
                <div key={playlist.id} className="playlist-item">
                  <div className="playlist-image-container">
                    <CachedImage
                      src={playlist.imageUrl}
                      className="playlist-image"
                      alt={playlist.title}
                    />
                  </div>
                  <h3 className="playlist-title">{playlist.title}</h3>
                  <p className="playlist-info">播放量：{playlist.plays}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Player />

      {/* 缓存管理器 */}
      <CacheManager
        isVisible={showCacheManager}
        onClose={() => setShowCacheManager(false)}
      />

      {/* 缓存管理按钮 */}
      <button
        className="cache-manager-button"
        onClick={() => setShowCacheManager(true)}
        title="缓存管理"
      >
        <i className="fas fa-database"></i>
      </button>
    </div>
  );
}

export default App;
