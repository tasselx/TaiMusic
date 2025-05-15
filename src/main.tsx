import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate } from 'react-router-dom';
import { KugouMusicService } from './services/KugouMusicService';

// 不引入 SCSS，完全使用内联样式
// import './styles/global.scss';

// 创建酷狗音乐服务实例
const kugouMusicService = new KugouMusicService();

// 简化版 SideNavbar
const SideNavbar = () => {
  return (
    <div style={{ 
      width: '200px', 
      height: '100%',
      background: '#181818', 
      padding: '16px',
      color: '#eee'
    }}>
      <div style={{ 
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2ecc71',
        marginBottom: '24px',
        paddingLeft: '12px'
      }}>
        Tai Music
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          padding: '0 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#777',
          marginBottom: '8px'
        }}>在线音乐</h3>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#2ecc71',
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>🎵</span>
          <span>发现音乐</span>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#aaa',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>🎙️</span>
          <span>播客</span>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#aaa',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>📺</span>
          <span>视频</span>
        </div>
      </div>
      
      <div>
        <h3 style={{ 
          padding: '0 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#777',
          marginBottom: '8px'
        }}>我的音乐</h3>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#aaa',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>❤️</span>
          <span>我喜欢</span>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#aaa',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>💾</span>
          <span>本地与下载</span>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          color: '#aaa',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          <span style={{ marginRight: '12px' }}>🕒</span>
          <span>最近播放</span>
        </div>
      </div>
    </div>
  );
};

// 简化版 Player
const Player = () => {
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '0 16px',
      color: '#eee'
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        flex: 1
      }}>
        <div style={{ 
          width: '50px',
          height: '50px',
          borderRadius: '4px',
          background: '#333',
          marginRight: '12px'
        }}></div>
        <div>
          <div style={{ fontWeight: 'bold' }}>星空漫游</div>
          <div style={{ fontSize: '12px', color: '#888' }}>陈思琪</div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 2,
        maxWidth: '600px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <button style={{ 
            background: 'transparent',
            border: 'none',
            color: '#888',
            padding: '8px',
            cursor: 'pointer'
          }}>⏮️</button>
          
          <button style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 8px',
            padding: '8px',
            color: '#111',
            background: '#2ecc71',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer'
          }}>▶️</button>
          
          <button style={{ 
            background: 'transparent',
            border: 'none',
            color: '#888',
            padding: '8px',
            cursor: 'pointer'
          }}>⏭️</button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '100%'
        }}>
          <span style={{ color: '#777', width: '40px', fontSize: '12px', textAlign: 'right' }}>02:14</span>
          <div style={{ 
            flex: 1,
            height: '4px',
            margin: '0 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute',
              height: '100%',
              width: '50%',
              background: '#2ecc71',
              borderRadius: '2px'
            }}></div>
          </div>
          <span style={{ color: '#777', width: '40px', fontSize: '12px' }}>04:32</span>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end'
      }}>
        <span style={{ color: '#888' }}>🔊</span>
      </div>
    </div>
  );
};

// 简化版 MainLayout
const MainLayout = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  
  // 启动酷狗音乐API服务器
  useEffect(() => {
    const startKugouApi = async () => {
      try {
        await kugouMusicService.startApiServer();
        console.log('酷狗音乐API服务器已启动');
      } catch (error) {
        console.error('启动酷狗音乐API服务器失败:', error);
      }
    };

    startKugouApi();
    
    // 组件卸载时停止服务器
    return () => {
      const stopKugouApi = async () => {
        try {
          await kugouMusicService.stopApiServer();
        } catch (error) {
          console.error('停止酷狗音乐API服务器失败:', error);
        }
      };
      
      stopKugouApi();
    };
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#111',
      color: 'white'
    }}>
      <div style={{ 
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        <SideNavbar />
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
            padding: '0 16px',
            background: 'rgba(255,255,255,0.03)'
          }}>
            <form 
              onSubmit={handleSearch}
              style={{ 
                flex: 1,
                maxWidth: '500px'
              }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '8px 16px',
              }}>
                <span style={{ marginRight: '8px', color: '#777' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="搜索音乐、歌手、歌单" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    width: '100%'
                  }} 
                />
              </div>
            </form>
            <div style={{ 
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👤
            </div>
          </div>
          <main style={{ 
            flex: 1,
            padding: '16px',
            overflow: 'auto'
          }}>
            <Outlet />
          </main>
        </div>
      </div>
      <div style={{ 
        height: '80px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: '#111'
      }}>
        <Player />
      </div>
    </div>
  );
};

// 简化的首页
const HomePage = () => {
  // 推荐歌单数据
  const recommendedPlaylists = [
    {
      id: 1,
      title: '电音混对精选',
      coverUrl: 'https://p3.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951164169494808.jpg',
      playCount: 128.5
    },
    {
      id: 2,
      title: '午后慵懒时光',
      coverUrl: 'https://p1.music.126.net/yhB4DCPsxG6YKvz8e_kpVQ==/109951167292155487.jpg',
      playCount: 89.3
    },
    {
      id: 3,
      title: '爵士乐精选集',
      coverUrl: 'https://p1.music.126.net/rV8WytTXoVKPNd_Snscg-w==/109951167434793854.jpg',
      playCount: 56.8
    },
    {
      id: 4,
      title: '复古情调',
      coverUrl: 'https://p1.music.126.net/WQ0n56RyGZe8-YPXKuZ9MA==/109951167238642565.jpg',
      playCount: 75.2
    },
    {
      id: 5,
      title: '轻音乐精选',
      coverUrl: 'https://p1.music.126.net/jh1V_ZPDXJVtMcKWXxLOyw==/18829136905110355.jpg',
      playCount: 92.1
    }
  ];

  return (
    <div>
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '16px' 
        }}>推荐歌单</h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {recommendedPlaylists.map((playlist) => (
            <div key={playlist.id} style={{ cursor: 'pointer' }}>
              <div style={{ 
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                marginBottom: '8px',
                borderRadius: '6px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.1)'
              }}>
                <img 
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ 
                fontWeight: '500',
                marginBottom: '4px'
              }}>{playlist.title}</div>
              <div style={{ 
                fontSize: '12px',
                color: '#777'
              }}>播放量：{playlist.playCount}万</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '16px' 
        }}>最近播放</h2>
        <table style={{ 
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0
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
              }}>歌曲标题</th>
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
            {[1, 2, 3, 4, 5].map((i) => (
              <tr 
                key={i} 
                style={{ 
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>{i}</td>
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
                      background: '#333'
                    }}></div>
                    <div>
                      <div style={{ fontWeight: '500' }}>星空漫游 {i}</div>
                    </div>
                  </div>
                </td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>陈思琪</td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>夜空之下</td>
                <td style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px'
                }}>4:32</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

// 简单页面组件
const LibraryPage = () => <div style={{color: 'white', padding: '20px'}}>本地与下载 (待开发)</div>;
const SettingsPage = () => <div style={{color: 'white', padding: '20px'}}>设置 (待开发)</div>;
const SearchPage = () => <div style={{color: 'white', padding: '20px'}}>搜索 (待开发)</div>;

// 创建路由
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      { path: '/library', element: <LibraryPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/settings', element: <SettingsPage /> }
    ],
  }
]);

// 添加全局样式
const style = document.createElement('style');
style.innerHTML = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    background-color: #111;
    color: #eee;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.5);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.7);
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
