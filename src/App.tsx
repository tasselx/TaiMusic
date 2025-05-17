import React, { useState, useEffect } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import SearchBar from './components/SearchBar';

// 定义搜索结果的接口
interface SearchResult {
  id?: string | number;
  name: string;
  singer: string;
  album: string;
  duration?: string;
  pic?: string;
}

const App: React.FC = () => {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [banners, setBanners] = useState([]);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const playlistData = [
    {
      id: 1,
      title: "星空漫游",
      artist: "陈思琪",
      album: "夜空之下",
      duration: "04:32",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"
    },
    {
      id: 2,
      title: "城市霓虹",
      artist: "李明轩",
      album: "都市物语",
      duration: "03:45",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/d37f02e4cac045e6c9230d9692eee71f.jpg"
    },
    {
      id: 3,
      title: "雨后彩虹",
      artist: "张雨晴",
      album: "春日记忆",
      duration: "05:18",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/d8ff2ed034e46e3e829cd5bd9c8483c7.jpg"
    },
    {
      id: 4,
      title: "海边微风",
      artist: "王海涛",
      album: "夏日情书",
      duration: "04:15",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/e6e7e62a51064304818286f3549376c6.jpg"
    },
    {
      id: 5,
      title: "山间晨曦",
      artist: "林清风",
      album: "自然之声",
      duration: "03:59",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/7085b61de7117e1f800c35e08efa6a3f.jpg"
    }
  ];

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
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/fc2eb9ec5941d5f270590f255eded30b.jpg"
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
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 检查API服务状态
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('/api/');
        if (response.ok) {
          setApiStatus('API服务运行中');
          // 获取首页Banner
          fetchBanners();
        } else {
          setApiStatus('API服务错误');
        }
      } catch (error) {
        setApiStatus('API服务连接失败');
        // 5秒后重试
        setTimeout(checkApiStatus, 5000);
      }
    }

    checkApiStatus();
  }, []);

  // 获取首页Banner
  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banner');
      const data = await response.json();
      if (data && data.data && data.data.banner) {
        setBanners(data.data.banner);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  // 搜索音乐
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await fetch(`/api/search?keywords=${encodeURIComponent(searchTerm)}&pagesize=20`);
      const data = await response.json();
      if (data && data.data && data.data.info) {
        setSearchResults(data.data.info);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    }
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
        <div
          className="user-button"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-user"></i>
        </div>
      </header>

      <div className="main-content">
        <nav className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">在线音乐</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <i className="fas fa-compass"></i>
                <span>发现音乐</span>
              </li>
              <li className="sidebar-menu-item">
                <i className="fas fa-podcast"></i>
                <span>播客</span>
              </li>
              <li className="sidebar-menu-item">
                <i className="fas fa-video"></i>
                <span>视频</span>
              </li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">我的音乐</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <i className="fas fa-heart"></i>
                <span>我喜欢</span>
              </li>
              <li className="sidebar-menu-item">
                <i className="fas fa-download"></i>
                <span>本地与下载</span>
              </li>
              <li className="sidebar-menu-item">
                <i className="fas fa-history"></i>
                <span>最近播放</span>
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
                        <img
                          src={song.pic || "https://ai-public.mastergo.com/ai/img_res/d182eccb133f8f85f65ac0b0c56773fb.jpg"}
                          className="song-image"
                          alt={song.name}
                        />
                        <span className="song-title search-result-text">{song.name}</span>
                      </div>
                      <div className="song-artist search-result-text">{song.singer}</div>
                      <div className="song-album search-result-text">{song.album}</div>
                      <div className="song-duration">{song.duration || "--:--"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="section-title">推荐歌单</h2>
            <div className="playlist-grid">
              {recommendedPlaylists.map(playlist => (
                <div key={playlist.id} className="playlist-item">
                  <div className="playlist-image-container">
                    <img
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

          <div>
            <h2 className="section-title">最近播放</h2>
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
        </main>
      </div>

      <footer className="player">
        <div className="now-playing">
          <img
            src="https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg"
            className="now-playing-image"
            alt="Current song"
          />
          <div className="now-playing-info">
            <h4>星空漫游</h4>
            <p>陈思琪</p>
          </div>
        </div>

        <div className="player-controls">
          <div className="player-buttons">
            <div className="player-button">
              <i className="fas fa-random"></i>
            </div>
            <div className="player-button">
              <i className="fas fa-step-backward"></i>
            </div>
            <div
              className="play-button"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </div>
            <div className="player-button">
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
    </div>
  );
}

export default App;
