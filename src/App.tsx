import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [banners, setBanners] = useState([]);

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

  // Enter键触发搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container">
      <h1>酷狗音乐 Tauri App</h1>
      <div className="status">API状态: {apiStatus}</div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="搜索音乐..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch}>搜索</button>
      </div>

      {banners.length > 0 && (
        <div className="banner-section">
          <h2>推荐内容</h2>
          <div className="banners">
            {banners.slice(0, 5).map((banner: any, index: number) => (
              <div key={index} className="banner-item">
                <img src={banner.pic} alt={banner.title} />
                <p>{banner.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>搜索结果</h2>
          <table>
            <thead>
              <tr>
                <th>歌曲</th>
                <th>歌手</th>
                <th>专辑</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((song: any, index: number) => (
                <tr key={index}>
                  <td>{song.songname}</td>
                  <td>{song.singername}</td>
                  <td>{song.album_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
