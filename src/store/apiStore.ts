import { create } from 'zustand';
import { ApiStatus, Banner, Playlist, Song } from './types';
import { DEFAULT_COVER, DAILY_RECOMMEND_COVER } from '../constants';
import { formatDuration, formatCoverUrl } from '../utils';

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

      const response = await fetch('/api/');

      if (response.ok) {
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
      const response = await fetch('/api/banner');
      const data = await response.json();

      if (data && data.data && data.data.banner) {
        // 转换数据格式
        const banners = data.data.banner.map((item: any) => ({
          id: item.id || Math.random(),
          imageUrl: item.pic || '',
          title: item.title || '',
          link: item.url || ''
        }));

        set({ banners });
      }
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
      const response = await fetch('http://localhost:3000/everyday/recommend');
      const data = await response.json();

      // 检查数据结构
      if (data && data.data) {
        console.log('API返回的数据中song_list_size:', data.data.song_list_size);

        // 使用song_list作为歌曲列表
        if (data.data.song_list && Array.isArray(data.data.song_list)) {
          const songList = data.data.song_list;
          console.log('找到歌曲列表，长度:', songList.length);

          if (songList.length > 0) {
            // 打印第一个歌曲项的所有字段，帮助调试
            console.log('第一个歌曲项的所有字段:', Object.keys(songList[0]));
          }

          // 转换数据格式
          const songs = songList.map((item: any) => {
            return {
              id: item.hash || item.audio_id || Math.random(),
              title: item.songname || item.song_name || '',
              artist: item.author_name || item.singername || '',
              album: item.album_name || item.album || '',
              duration: formatDuration(item.duration || item.time_length),
              imageUrl: item.sizable_cover ? formatCoverUrl(item.sizable_cover) : (item.album_img || item.img || DEFAULT_COVER)
            };
          });

          console.log('转换后的歌曲数据数量:', songs.length);
          set({ dailyRecommendations: songs });
        } else {
          console.error('API返回的数据中没有song_list字段或不是数组');
        }
      } else {
        console.error('API返回的数据结构不符合预期:', data);
      }
    } catch (error) {
      console.error('获取每日推荐失败:', error);
    }
  }
}));

export default useApiStore;
