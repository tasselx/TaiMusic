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
}

// 歌单类型
export interface Playlist {
  id: number;
  title: string;
  plays: string;
  imageUrl: string;
}

// 歌曲类型
export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
}

// 轮播图类型
export interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  link: string;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  avatar: string;
  isLoggedIn: boolean;
  token?: string;
}
