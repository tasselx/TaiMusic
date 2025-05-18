import { create } from 'zustand';
import { ApiStatus, Banner, Playlist, Song } from './types';
import { DAILY_RECOMMEND_COVER } from '../constants';
import { apiService } from '../utils';

/**
 * API状态接口
 */
interface ApiState {
  // API服务状态
  apiStatus: ApiStatus;
  // 轮播图数据
  banners: Banner[];
  // 推荐歌单
  recommendedPlaylists: Playlist[];
  // 每日推荐歌曲
  dailyRecommendations: Song[];

  // 设置API状态
  setApiStatus: (status: ApiStatus) => void;
  // 设置轮播图数据
  setBanners: (banners: Banner[]) => void;
  // 设置推荐歌单
  setRecommendedPlaylists: (playlists: Playlist[]) => void;
  // 设置每日推荐歌曲
  setDailyRecommendations: (songs: Song[]) => void;

  // 检查API服务状态
  checkApiStatus: () => Promise<boolean>;
  // 获取轮播图数据
  fetchBanners: () => Promise<void>;
  // 获取推荐歌单
  fetchRecommendedPlaylists: () => Promise<void>;
  // 获取每日推荐歌曲
  fetchDailyRecommendations: () => Promise<void>;
}

/**
 * API状态管理
 */
const useApiStore = create<ApiState>((set, get) => ({
  // 初始状态
  apiStatus: { status: 'idle', message: 'Loading...' },
  banners: [],
  dailyRecommendations: [],
  recommendedPlaylists: [
    {
      id: 1,
      title: "电音派对精选",
      plays: "128.5万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/82459f6f89c1f4acce823726b8c34d03.jpg"
    },
    {
      id: 2,
      title: "午后慵懒时光",
      plays: "89.3万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/b3847335758e50880f499a70f3a8952e.jpg"
    },
    {
      id: 3,
      title: "爵士乐精选集",
      plays: "56.8万",
      imageUrl: DAILY_RECOMMEND_COVER
    },
    {
      id: 4,
      title: "复古情歌集",
      plays: "75.2万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/ed10695bb5474de5384df49f900dfd59.jpg"
    },
    {
      id: 5,
      title: "轻音乐精选",
      plays: "92.1万",
      imageUrl: "https://ai-public.mastergo.com/ai/img_res/326ab5641b3c96cdd380787272b20597.jpg"
    }
  ],

  // 设置API状态
  setApiStatus: (apiStatus) => set({ apiStatus }),

  // 设置轮播图数据
  setBanners: (banners) => set({ banners }),

  // 设置推荐歌单
  setRecommendedPlaylists: (playlists) => set({ recommendedPlaylists: playlists }),

  // 设置每日推荐歌曲
  setDailyRecommendations: (songs) => set({ dailyRecommendations: songs }),

  // 检查API服务状态
  checkApiStatus: async () => {
    try {
      set({ apiStatus: { status: 'loading', message: '正在连接API服务...' } });

      const isApiAvailable = await apiService.checkApiStatus();

      if (isApiAvailable) {
        set({ apiStatus: { status: 'success', message: 'API服务运行中' } });

        // 获取首页数据
        get().fetchBanners();
        get().fetchRecommendedPlaylists();
        get().fetchDailyRecommendations();

        return true;
      } else {
        set({ apiStatus: { status: 'error', message: 'API服务错误' } });
        return false;
      }
    } catch (error) {
      console.error('API服务连接失败:', error);
      set({ apiStatus: { status: 'error', message: 'API服务连接失败' } });
      return false;
    }
  },

  // 获取轮播图数据
  fetchBanners: async () => {
    try {
      const banners = await apiService.getBanners();
      set({ banners });
    } catch (error) {
      console.error('获取轮播图失败:', error);
    }
  },

  // 获取推荐歌单
  fetchRecommendedPlaylists: async () => {
    try {
      // 这里可以添加获取推荐歌单的API请求
      // 目前使用默认数据
      const { recommendedPlaylists } = get();
      set({ recommendedPlaylists });
    } catch (error) {
      console.error('获取推荐歌单失败:', error);
    }
  },

  // 获取每日推荐歌曲
  fetchDailyRecommendations: async () => {
    try {
      console.log('开始获取每日推荐数据...');
      const songs = await apiService.getDailyRecommendations();

      console.log('获取到每日推荐歌曲数量:', songs.length);
      set({ dailyRecommendations: songs });
    } catch (error) {
      console.error('获取每日推荐失败:', error);
    }
  }
}));

export default useApiStore;
