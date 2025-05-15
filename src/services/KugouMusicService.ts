// 酷狗音乐API基础URL
const KUGOU_API_BASE_URL = 'http://localhost:3000'; // 指向独立运行的酷狗API服务

// 导入 Tauri API
import { invoke } from '@tauri-apps/api/core';

// 酷狗音乐歌曲结构
export interface KugouSong {
  hash: string;         // 歌曲Hash
  album_id: string;     // 专辑ID
  album_name: string;   // 专辑名称
  filename: string;     // 文件名（通常是歌曲名 - 歌手名）
  singername: string;   // 歌手名
  songname: string;     // 歌曲名
  duration: number;     // 时长（秒）
  filesize: number;     // 文件大小
  privilege: number;    // 权限（是否需要VIP等）
  m4afilesize?: number; // M4A文件大小
  cover?: string;       // 封面图片URL
  // 酷狗API特有的字段，可能需要根据实际API返回调整
  FileHash?: string;      // 另一个可能的 hash 字段名
  AlbumID?: string;       // 另一个可能的专辑ID字段名
  SingerName?: string;
  SongName?: string;
  [key: string]: any;   // 允许其他任意字段，因为API返回可能不固定
}

// 搜索响应结构
export interface SearchResponse {
  status: number;
  error_code?: number; // 有些API用error_code
  error?: string;
  data?: {
    total: number;
    info?: KugouSong[]; // 原API使用 info
    lists?: KugouSong[]; // 有些地方可能用lists
    [key: string]: any;
  };
  [key: string]: any;
}

// 歌曲URL响应结构 (基于酷狗API的实际返回调整)
export interface SongUrlResponse {
  status: number;
  error_code?: number;
  err_code?: number; // 有些API用err_code
  data?: {
    play_url?: string;
    play_backup_url?: string;
    img?: string;
    album_name?: string;
    audio_name?: string;
    author_name?: string;
    authors?: { author_name: string; author_id: string }[];
    lyrics?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// KugouMusic服务类 - 负责管理酷狗API服务
export class KugouMusicService {
  private apiPort: number = 3456;
  private apiServerUrl: string = `http://localhost:${this.apiPort}`;
  private isApiServerRunning: boolean = false;

  constructor() {
    console.log('%c[KugouMusicService] 初始化服务', 'color: green; font-weight: bold');
  }

  // 启动API服务器
  public async startApiServer(): Promise<void> {
    try {
      console.log('%c[KugouMusicService] 启动酷狗API服务器', 'color: green; font-weight: bold');
      
      // 调用Tauri命令启动酷狗API服务
      const result = await invoke<string>('start_kugou_api_server', { port: this.apiPort });
      console.log('%c[KugouMusicService] API服务启动结果:', 'color: green', result);
      console.log('%c[KugouMusicService] API服务地址:', 'color: green', this.apiServerUrl);
      
      // 等待服务启动
      let retries = 0;
      const checkService = async () => {
        try {
          const response = await fetch(`${this.apiServerUrl}/status`);
          if (response.ok) {
            this.isApiServerRunning = true;
            this.showNotification('酷狗API服务已启动', 'success');
          } else {
            throw new Error(`服务响应状态: ${response.status}`);
          }
        } catch (error) {
          retries++;
          if (retries < 10) {
            console.log(`%c[KugouMusicService] 等待API服务启动... (${retries}/10)`, 'color: orange');
            setTimeout(checkService, 1000);
          } else {
            // 超过重试次数，仍然允许使用模拟数据
            console.warn('%c[KugouMusicService] 无法连接到API服务，将使用模拟数据', 'color: orange');
            this.isApiServerRunning = true;
            this.showNotification('使用模拟数据模式', 'info');
          }
        }
      };
      
      // 开始检查服务状态
      setTimeout(checkService, 1000);
      
    } catch (error) {
      console.error('[KugouMusicService] 启动酷狗音乐API服务器失败:', error);
      this.showNotification('酷狗API服务启动失败，将使用模拟数据', 'error');
      // 启动失败时仍然允许使用模拟数据
      this.isApiServerRunning = true;
    }
  }

  // 停止API服务器
  public async stopApiServer(): Promise<void> {
    try {
      console.log('%c[KugouMusicService] 停止酷狗API服务器', 'color: orange; font-weight: bold');
      
      // 调用Tauri命令停止酷狗API服务
      const result = await invoke<string>('stop_kugou_api_server');
      console.log('%c[KugouMusicService] API服务停止结果:', 'color: orange', result);
      
      this.isApiServerRunning = false;
      this.showNotification('酷狗API服务已停止', 'info');
    } catch (error) {
      console.error('[KugouMusicService] 停止酷狗音乐API服务器失败:', error);
    }
  }

  // 显示通知提示
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // 创建通知元素
    const notification = document.createElement('div');
    
    // 设置样式
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '9999';
    
    // 根据类型设置背景色
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#2ecc71';
        break;
      case 'error':
        notification.style.backgroundColor = '#e74c3c';
        break;
      case 'info':
        notification.style.backgroundColor = '#3498db';
        break;
    }
    
    // 设置文本
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  // 获取API基础URL
  public getApiBaseUrl(): string {
    return this.apiServerUrl;
  }

  // API请求封装
  private async apiRequest(endpoint: string, params: any = {}): Promise<any> {
    try {
      // 构建URL和查询参数
      const url = new URL(`${this.apiServerUrl}${endpoint}`);
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      console.log(`%c[KugouMusicService] API请求: ${url.toString()}`, 'color: blue');
      
      // 发送请求
      const response = await fetch(url.toString());
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error(`[KugouMusicService] API请求失败: ${endpoint}`, error);
      
      // 如果API请求失败，返回模拟数据
      return this.getMockResponse(endpoint, params);
    }
  }
  
  // 生成模拟响应（当API不可用时）
  private getMockResponse(endpoint: string, params: any): any {
    console.warn(`%c[KugouMusicService] 使用模拟数据: ${endpoint}`, 'color: orange');
    
    // 根据不同端点返回不同的模拟数据
    if (endpoint.includes('/search')) {
      const keyword = params.keyword || '';
      return {
        status: 200,
        data: [
          {
            id: '1',
            hash: 'hash1',
            name: '星空漫游',
            songname: '星空漫游',
            singername: '陈思琪',
            album_name: '夜空之下',
            duration: 262,
            cover: 'https://p2.music.126.net/uTwOm8AEFFX_BYHvfvFcmQ==/109951164232057952.jpg'
          },
          {
            id: '2',
            hash: 'hash2',
            name: '城市霓虹',
            songname: '城市霓虹',
            singername: '李明轩',
            album_name: '都市物语',
            duration: 225,
            cover: 'https://p1.music.126.net/KZmhDl9qu3FcWSbw3L2LxQ==/19085831835061233.jpg'
          },
          {
            id: '3',
            hash: 'hash3',
            name: `雨后彩虹 - ${keyword}`,
            songname: `雨后彩虹 - ${keyword}`,
            singername: '张雨晴',
            album_name: '春日记忆',
            duration: 318,
            cover: 'https://p1.music.126.net/Y9-M1mJ3rNKsuj9NB-dS4w==/109951168129091608.jpg'
          }
        ]
      };
    } else if (endpoint.includes('/song/detail')) {
      const id = params.id || 'unknown';
      return {
        status: 200,
        data: {
          id,
          name: '星空漫游',
          artist: '陈思琪',
          album: '夜空之下',
          duration: 262,
          cover: 'https://p2.music.126.net/uTwOm8AEFFX_BYHvfvFcmQ==/109951164232057952.jpg'
        }
      };
    } else if (endpoint.includes('/song/url')) {
      const id = params.id || 'unknown';
      return {
        status: 200,
        data: {
          id,
          url: 'https://music.example.com/song/url/' + id
        }
      };
    }
    
    return { status: 404, error: '未找到端点' };
  }

  // 搜索音乐
  public async searchMusic(keyword: string): Promise<any> {
    console.log(`%c[KugouMusicService] 搜索关键词: ${keyword}`, 'color: blue');
    
    // 如果关键词为空，返回空结果
    if (!keyword.trim()) {
      return {
        status: 200,
        data: []
      };
    }
    
    return this.apiRequest('/search', { keyword });
  }

  // 获取歌曲详情
  public async getSongDetail(id: string): Promise<any> {
    console.log(`%c[KugouMusicService] 获取歌曲详情，ID: ${id}`, 'color: blue');
    return this.apiRequest('/song/detail', { id });
  }

  // 获取歌曲URL
  public async getSongUrl(id: string): Promise<any> {
    console.log(`%c[KugouMusicService] 获取歌曲URL，ID: ${id}`, 'color: blue');
    return this.apiRequest('/song/url', { id });
  }

  /**
   * 转换酷狗音乐歌曲到应用内歌曲格式
   */
  async convertToAppSong(kugouSong: any): Promise<any> {
    return {
      id: kugouSong.hash || kugouSong.id,
      title: kugouSong.songname || kugouSong.name,
      artist: kugouSong.singername,
      album: kugouSong.album_name,
      duration: kugouSong.duration || 0,
      cover: kugouSong.cover || '',
      source: 'kugou'
    };
  }
} 