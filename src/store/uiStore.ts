import { create } from 'zustand';

/**
 * UI状态接口
 */
interface UIState {
  // 窗口宽度
  windowWidth: number;
  // 窗口高度
  windowHeight: number;
  // 是否最大化
  isMaximized: boolean;
  // 当前活动页面
  activePage: string;
  // 侧边栏是否折叠
  isSidebarCollapsed: boolean;
  
  // 设置窗口尺寸
  setWindowSize: (width: number, height: number) => void;
  // 设置最大化状态
  setMaximized: (isMaximized: boolean) => void;
  // 设置活动页面
  setActivePage: (page: string) => void;
  // 切换侧边栏折叠状态
  toggleSidebar: () => void;
  // 设置侧边栏折叠状态
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * UI状态管理
 */
const useUIStore = create<UIState>((set, get) => ({
  // 初始状态
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  isMaximized: false,
  activePage: 'home',
  isSidebarCollapsed: false,
  
  // 设置窗口尺寸
  setWindowSize: (width, height) => set({ windowWidth: width, windowHeight: height }),
  
  // 设置最大化状态
  setMaximized: (isMaximized) => set({ isMaximized }),
  
  // 设置活动页面
  setActivePage: (page) => set({ activePage: page }),
  
  // 切换侧边栏折叠状态
  toggleSidebar: () => {
    const { isSidebarCollapsed } = get();
    set({ isSidebarCollapsed: !isSidebarCollapsed });
  },
  
  // 设置侧边栏折叠状态
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed })
}));

export default useUIStore;
