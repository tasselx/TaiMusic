/**
 * API服务
 * 封装所有API请求，统一管理API接口
 */
import { get } from './httpClient';
import { formatCoverUrlByUsage } from './formatters';

// API接口常量
export const API_ENDPOINTS = {
  // 基础接口
  BASE: '/',
  // 轮播图
  BANNER: '/banner',
  // 每日推荐
  DAILY_RECOMMEND: '/everyday/recommend',
  // 搜索
  SEARCH: '/search',
  // 热门搜索
  SEARCH_HOT: '/search/hot',
  // 歌曲详情
  SONG_DETAIL: '/song/detail',
  // 歌曲URL
  SONG_URL: '/song/url',
  // 歌词
  LYRIC: '/lyric',
  // 专辑详情
  ALBUM_DETAIL: '/album/detail',
  // 用户详情
  USER_DETAIL: '/user/detail',
  // 用户状态
  USER_STATUS: '/user/status',
  // 登录相关
  LOGIN_CELLPHONE: '/login/cellphone',
  CAPTCHA_SENT: '/captcha/sent',
};

/**
 * 歌曲接口
 */
export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  url?: string;
}

/**
 * 轮播图接口
 */
export interface Banner {
  id: string | number;
  imageUrl: string;
  title: string;
  link: string;
}

/**
 * 歌单接口
 */
export interface Playlist {
  id: string | number;
  title: string;
  plays: string;
  imageUrl: string;
}

/**
 * 默认封面图片
 */
export const DEFAULT_COVER = '/src/assets/default-cover.jpg';

/**
 * 用户接口
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar: string;
  token?: string;
}

/**
 * API服务类
 */
class ApiService {
  /**
   * 检查API服务状态
   * @returns Promise<boolean>
   */
  public async checkApiStatus(): Promise<boolean> {
    try {
      const response = await get(API_ENDPOINTS.BASE);
      // 使用 status === 1 作为成功标准
      return response && response.status === 1;
    } catch (error) {
      console.error('API服务连接失败:', error);
      return false;
    }
  }

  /**
   * 获取轮播图
   * @returns Promise<Banner[]>
   */
  public async getBanners(): Promise<Banner[]> {
    try {
      const response = await get(API_ENDPOINTS.BANNER);

      if (response && response.status === 1 && response.data && response.data.banner) {
        // 转换数据格式
        return response.data.banner.map((item: any) => ({
          id: item.id || Math.random(),
          imageUrl: item.pic || '',
          title: item.title || '',
          link: item.url || ''
        }));
      }

      return [];
    } catch (error) {
      console.error('获取轮播图失败:', error);
      return [];
    }
  }

  /**
   * 获取每日推荐歌曲
   * @returns Promise<Song[]>
   */
  public async getDailyRecommendations(): Promise<Song[]> {
    try {
      console.log('开始获取每日推荐数据...');
      const response = await get(API_ENDPOINTS.DAILY_RECOMMEND);

      // 检查数据结构
      if (response && response.status === 1 && response.data) {
        console.log('API返回的数据中song_list_size:', response.data.song_list_size);

        // 使用song_list作为歌曲列表
        if (response.data.song_list && Array.isArray(response.data.song_list)) {
          const songList = response.data.song_list;
          console.log('找到歌曲列表，长度:', songList.length);

          if (songList.length > 0) {
            // 打印第一个歌曲项的所有字段，帮助调试
            console.log('第一个歌曲项的所有字段:', Object.keys(songList[0]));
          }

          // 转换数据格式
          return songList.map((item: any) => {
            const imageUrl = item.sizable_cover ? formatCoverUrlByUsage(item.sizable_cover, 'list') : (item.album_img || item.img || DEFAULT_COVER);

            return {
              id: item.hash || item.audio_id || Math.random(),
              title: item.songname || item.song_name || '',
              artist: item.author_name || item.singername || '',
              album: item.album_name || item.album || '',
              duration: this.formatDuration(item.duration || item.time_length),
              imageUrl: imageUrl
            };
          });
        }
      }

      return [];
    } catch (error) {
      console.error('获取每日推荐失败:', error);
      return [];
    }
  }

  /**
   * 搜索音乐
   * @param keyword 搜索关键词
   * @param page 页码
   * @param pageSize 每页数量
   * @returns Promise<Song[]>
   */
  public async searchMusic(keyword: string, page: number = 1, pageSize: number = 20): Promise<Song[]> {
    try {
      if (!keyword.trim()) {
        return [];
      }

      const response = await get(API_ENDPOINTS.SEARCH, {
        keywords: keyword,
        page,
        pagesize: pageSize
      });

      if (response && response.status === 1 && response.data && response.data.info) {
        // 转换数据格式
        return response.data.info.map((item: any) => ({
          id: item.hash || item.audio_id || Math.random(),
          title: item.songname || item.song_name || '',
          artist: item.author_name || item.singername || '',
          album: item.album_name || item.album || '',
          duration: this.formatDuration(item.duration || item.time_length),
          imageUrl: item.sizable_cover ? formatCoverUrlByUsage(item.sizable_cover, 'list') : (item.album_img || item.img || DEFAULT_COVER)
        }));
      }

      return [];
    } catch (error) {
      console.error('搜索音乐失败:', error);
      return [];
    }
  }

  /**
   * 获取热门搜索关键词
   * @returns Promise<string[]>
   */
  public async getHotSearchKeywords(): Promise<string[]> {
    try {
      const response = await get(API_ENDPOINTS.SEARCH_HOT);

      if (response && response.status === 1 && response.data && response.data.info) {
        return response.data.info.map((item: any) => item.keyword || '');
      }

      return [];
    } catch (error) {
      console.error('获取热门搜索关键词失败:', error);
      return [];
    }
  }

  /**
   * 获取用户详情
   * @param userId 用户ID
   * @returns Promise<UserInfo>
   */
  public async getUserDetail(userId: string): Promise<UserInfo> {
    try {
      const response = await get(API_ENDPOINTS.USER_DETAIL, { userid: userId });

      if (response && response.status === 1 && response.data) {
        return {
          id: userId,
          username: response.data.nickname || `用户${userId.substring(0, 4)}`,
          nickname: response.data.nickname,
          avatar: response.data.avatar || 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
        };
      }

      // 如果没有获取到用户信息，使用默认值
      return {
        id: userId,
        username: `用户${userId.substring(0, 4)}`,
        avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
      };
    } catch (error) {
      console.error('获取用户详情失败:', error);
      // 返回默认用户信息
      return {
        id: userId,
        username: `用户${userId.substring(0, 4)}`,
        avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
      };
    }
  }

  /**
   * 检查用户登录状态
   * @param token 用户令牌
   * @returns Promise<boolean>
   */
  public async checkUserStatus(token: string): Promise<boolean> {
    try {
      const response = await get(API_ENDPOINTS.USER_STATUS, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response && response.status === 1;
    } catch (error) {
      console.error('检查用户状态失败:', error);
      return false;
    }
  }

  /**
   * 格式化时长
   * @param duration 时长（秒）
   * @returns 格式化后的时长
   */
  private formatDuration(duration?: number | string): string {
    if (!duration) return '--:--';

    // 如果已经是格式化的字符串（包含冒号），直接返回
    if (typeof duration === 'string' && duration.includes(':')) {
      // 检查是否已经是两位格式
      const parts = duration.split(':');
      if (parts.length === 2) {
        const minutes = parts[0].padStart(2, '0');
        const seconds = parts[1].padStart(2, '0');
        return `${minutes}:${seconds}`;
      }
      return duration;
    }

    // 转换为数字
    const durationNum = typeof duration === 'string' ? parseInt(duration, 10) : duration;

    // 计算分钟和秒数
    const minutes = Math.floor(durationNum / 60);
    const seconds = Math.floor(durationNum % 60);

    // 格式化为两位数
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;
