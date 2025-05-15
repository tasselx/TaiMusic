import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KugouMusicService } from '../services/KugouMusicService';

// 创建KugouMusicService实例
const kugouMusicService = new KugouMusicService();

// 格式化时间
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('输入关键词开始搜索');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // 从URL参数中获取关键词
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const keywordParam = searchParams.get('keyword');
    
    if (keywordParam) {
      setKeyword(keywordParam);
      handleSearch(keywordParam);
    }
  }, [location.search]);

  // 搜索处理函数
  const handleSearch = async (searchKeyword?: string) => {
    const searchTerm = searchKeyword || keyword;
    
    if (!searchTerm.trim()) {
      setMessage('请输入搜索关键词');
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setMessage('搜索中...');
      
      const response = await kugouMusicService.searchMusic(searchTerm);
      
      if (response.status === 200 && response.data && response.data.length > 0) {
        setResults(response.data);
        setMessage('');
      } else {
        setResults([]);
        setMessage('未找到相关歌曲');
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setMessage('搜索失败，请稍后重试');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  // 处理搜索表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      // 更新URL，这样可以分享或书签
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      handleSearch();
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (keyword.trim()) {
        navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
        handleSearch();
      }
    }
  };

  // 播放歌曲（模拟）
  const playSong = (song: any) => {
    console.log('播放歌曲:', song);
    // 这里只是模拟，实际应用中会调用播放器功能
    alert(`播放歌曲: ${song.songname || song.name} - ${song.singername}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <form 
        onSubmit={handleFormSubmit}
        style={{
          marginBottom: '20px'
        }}
      >
        <div style={{
          display: 'flex'
        }}>
          <input
            type="text"
            placeholder="搜索歌曲、歌手、专辑"
            value={keyword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: '10px 15px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: '#2ecc71',
              color: '#111',
              fontSize: '16px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </form>

      {message && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#888'
        }}>
          {message}
        </div>
      )}

      {results.length > 0 && (
        <table style={{ 
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          marginTop: '20px'
        }}>
          <thead>
            <tr>
              <th style={{ 
                padding: '10px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#777',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                width: '50px'
              }}>#</th>
              <th style={{ 
                padding: '10px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#777',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>歌曲</th>
              <th style={{ 
                padding: '10px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#777',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>歌手</th>
              <th style={{ 
                padding: '10px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#777',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>专辑</th>
              <th style={{ 
                padding: '10px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#777',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                width: '80px'
              }}>时长</th>
            </tr>
          </thead>
          <tbody>
            {results.map((song, index) => (
              <tr 
                key={song.id || index}
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => playSong(song)}
              >
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>{index + 1}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '4px',
                      marginRight: '12px',
                      overflow: 'hidden',
                      background: '#333',
                      position: 'relative'
                    }}>
                      {song.cover && (
                        <img 
                          src={song.cover} 
                          alt={song.songname || song.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{song.songname || song.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>{song.singername}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>{song.album_name || '未知专辑'}</td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>{formatDuration(song.duration || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchPage; 