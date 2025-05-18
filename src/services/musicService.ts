/**
 * 音乐服务
 * 封装与音乐相关的API请求
 */
import { get, post } from '../utils/httpClient';
import { formatCoverUrl } from '../utils/formatters';
import { DEFAULT_COVER } from '../constants';

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
 * 歌单接口
 */
export interface Playlist {
  id: string | number;
  title: string;
  plays: string;
  imageUrl: string;
  songCount?: number;
  description?: string;
}

/**
 * 获取每日推荐歌曲
 * @returns Promise<Song[]>
 */
export const getDailyRecommendations = async (): Promise<Song[]> => {
  try {
    const response = await get('/everyday/recommend');
    
    if (response && response.data && response.data.song_list && Array.isArray(response.data.song_list)) {
      const songList = response.data.song_list;
      
      // 转换数据格式
      return songList.map((item: any) => ({
        id: item.hash || item.audio_id || Math.random(),
        title: item.songname || item.song_name || '',
        artist: item.author_name || item.singername || '',
        album: item.album_name || item.album || '',
        duration: formatDuration(item.duration || item.time_length),
        imageUrl: item.sizable_cover ? formatCoverUrl(item.sizable_cover) : (item.album_img || item.img || DEFAULT_COVER)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('获取每日推荐失败:', error);
    return [];
  }
};

/**
 * 搜索音乐
 * @param keyword 搜索关键词
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Promise<Song[]>
 */
export const searchMusic = async (keyword: string, page: number = 1, pageSize: number = 20): Promise<Song[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }
    
    const response = await get('/search', {
      keywords: keyword,
      page,
      pagesize: pageSize
    });
    
    if (response && response.data && response.data.info) {
      // 转换数据格式
      return response.data.info.map((item: any) => ({
        id: item.hash || item.audio_id || Math.random(),
        title: item.songname || item.song_name || '',
        artist: item.author_name || item.singername || '',
        album: item.album_name || item.album || '',
        duration: formatDuration(item.duration || item.time_length),
        imageUrl: item.sizable_cover ? formatCoverUrl(item.sizable_cover) : (item.album_img || item.img || DEFAULT_COVER)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('搜索音乐失败:', error);
    return [];
  }
};

/**
 * 获取歌曲详情
 * @param songId 歌曲ID
 * @returns Promise<Song | null>
 */
export const getSongDetail = async (songId: string): Promise<Song | null> => {
  try {
    const response = await get('/song/detail', { hash: songId });
    
    if (response && response.data) {
      const songData = response.data;
      
      return {
        id: songId,
        title: songData.songname || songData.song_name || '',
        artist: songData.author_name || songData.singername || '',
        album: songData.album_name || songData.album || '',
        duration: formatDuration(songData.duration || songData.time_length),
        imageUrl: songData.sizable_cover ? formatCoverUrl(songData.sizable_cover) : (songData.album_img || songData.img || DEFAULT_COVER),
        url: songData.url || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取歌曲详情失败:', error);
    return null;
  }
};

/**
 * 获取歌单详情
 * @param playlistId 歌单ID
 * @returns Promise<{playlist: Playlist, songs: Song[]}>
 */
export const getPlaylistDetail = async (playlistId: string): Promise<{playlist: Playlist, songs: Song[]}> => {
  try {
    const response = await get('/playlist/detail', { id: playlistId });
    
    if (response && response.data) {
      const playlistData = response.data;
      
      // 构建歌单信息
      const playlist: Playlist = {
        id: playlistId,
        title: playlistData.name || '',
        plays: `${playlistData.playCount || 0}`,
        imageUrl: playlistData.coverImgUrl || DEFAULT_COVER,
        songCount: playlistData.trackCount || 0,
        description: playlistData.description || ''
      };
      
      // 构建歌曲列表
      const songs: Song[] = (playlistData.tracks || []).map((item: any) => ({
        id: item.id || Math.random(),
        title: item.name || '',
        artist: (item.ar && item.ar[0] && item.ar[0].name) || '',
        album: (item.al && item.al.name) || '',
        duration: formatDuration(item.dt / 1000),
        imageUrl: (item.al && item.al.picUrl) || DEFAULT_COVER
      }));
      
      return { playlist, songs };
    }
    
    return { 
      playlist: { id: playlistId, title: '', plays: '0', imageUrl: DEFAULT_COVER },
      songs: []
    };
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    return { 
      playlist: { id: playlistId, title: '', plays: '0', imageUrl: DEFAULT_COVER },
      songs: []
    };
  }
};

/**
 * 格式化时长
 * @param duration 时长（秒）
 * @returns 格式化后的时长
 */
const formatDuration = (duration?: number | string): string => {
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
};
