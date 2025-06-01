/**
 * 通用状态类型定义
 */

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// API响应状态类型
export interface ApiStatus {
  status: LoadingState;
  message: string;
}

// 搜索结果类型
export interface SearchResult {
  id?: string | number;
  name: string;
  singer: string;
  album: string;
  duration?: string;
  pic?: string;
  sizable_cover?: string; // 可调整大小的封面URL
}

// 歌单类型
export interface Playlist {
  id: string | number;
  title: string;
  plays: string;
  imageUrl: string;
}

// 歌曲类型
export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  sizable_cover?: string; // 可调整大小的封面URL
  url?: string; // 歌曲播放地址
  hash?: string; // 歌曲hash，用于获取播放URL
  coverUrl?: string; // 播放器使用的封面URL字段
}

// 轮播图类型
export interface Banner {
  id: string | number;
  imageUrl: string;
  title: string;
  link: string;
}

// 用户类型 - 根据实际API响应结构定义
export interface UserInfo {
  id: string;
  username: string;
  avatar: string;
  isLoggedIn: boolean;
  token?: string;
  vip_type?: number;    // VIP类型 (0:普通 1:VIP)
  vip_token?: string;   // VIP令牌
}

// Toast通知类型
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // 持续时间，毫秒，0表示不自动关闭
  closable?: boolean; // 是否显示关闭按钮
  createdAt: number;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
  closable?: boolean;
  position?: ToastPosition;
}
