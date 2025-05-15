import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import Debug from './debug';
import { useEffect } from 'react';
import { KugouMusicService } from './services/KugouMusicService';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'library',
        element: <LibraryPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'debug',
        element: <Debug />,
      },
    ],
  },
]);

// 创建酷狗音乐服务实例
const kugouMusicService = new KugouMusicService();

function App() {
  // 启动酷狗音乐API服务器
  useEffect(() => {
    // 强制使用深色主题
    document.documentElement.classList.add('dark');
    
    const startKugouApi = async () => {
      try {
        await kugouMusicService.startApiServer();
        console.log('酷狗音乐API服务器已启动');
      } catch (error) {
        console.error('启动酷狗音乐API服务器失败:', error);
      }
    };

    startKugouApi();
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
