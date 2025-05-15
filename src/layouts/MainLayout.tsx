import { Outlet } from 'react-router-dom';
import { SideNavbar } from '../components/SideNavbar';
import { Player } from '../components/Player';
import '../components/components.scss';

const MainLayout = () => {
  return (
    <div className="layout-container">
      {/* 主内容区 */}
      <div className="layout-main">
        <SideNavbar />
        <div className="content-area">
          {/* 顶部搜索栏 */}
          <div className="top-bar">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="搜索音乐、歌手、歌单" className="search-input" />
            </div>
            <div className="user-profile">
              <svg xmlns="http://www.w3.org/2000/svg" className="user-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* 页面内容 */}
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 底部播放器 */}
      <div className="player-container">
        <Player />
      </div>
    </div>
  );
};

export default MainLayout; 