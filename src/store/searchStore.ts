import { create } from 'zustand';
import { SearchResult, LoadingState } from './types';
import { apiService } from '../utils';

/**
 * 搜索状态接口
 */
interface SearchState {
  // 搜索关键词
  searchTerm: string;
  // 搜索结果
  searchResults: SearchResult[];
  // 搜索历史
  searchHistory: string[];
  // 搜索状态
  searchStatus: LoadingState;
  // 搜索错误信息
  searchError: string | null;

  // 设置搜索关键词
  setSearchTerm: (term: string) => void;
  // 设置搜索结果
  setSearchResults: (results: SearchResult[]) => void;
  // 添加搜索历史
  addSearchHistory: (term: string) => void;
  // 清除搜索历史
  clearSearchHistory: () => void;
  // 设置搜索状态
  setSearchStatus: (status: LoadingState, error?: string) => void;
  // 执行搜索
  performSearch: (term?: string) => Promise<void>;
}

/**
 * 搜索状态管理
 */
const useSearchStore = create<SearchState>((set, get) => ({
  // 初始状态
  searchTerm: '',
  searchResults: [],
  searchHistory: [],
  searchStatus: 'idle',
  searchError: null,

  // 设置搜索关键词
  setSearchTerm: (term) => set({ searchTerm: term }),

  // 设置搜索结果
  setSearchResults: (results) => set({ searchResults: results }),

  // 添加搜索历史
  addSearchHistory: (term) => {
    if (!term.trim()) return;

    const { searchHistory } = get();
    // 如果已存在，则移除旧的
    const filteredHistory = searchHistory.filter(item => item !== term);
    // 添加到历史记录的开头
    set({ searchHistory: [term, ...filteredHistory].slice(0, 10) });
  },

  // 清除搜索历史
  clearSearchHistory: () => set({ searchHistory: [] }),

  // 设置搜索状态
  setSearchStatus: (status, error = null) => set({
    searchStatus: status,
    searchError: error
  }),

  // 执行搜索
  performSearch: async (term) => {
    const { searchTerm } = get();
    const finalTerm = term || searchTerm;

    if (!finalTerm.trim()) {
      set({ searchResults: [], searchStatus: 'idle' });
      return;
    }

    // 设置加载状态
    set({ searchStatus: 'loading', searchError: null });

    try {
      // 使用API服务发起搜索请求
      const songs = await apiService.searchMusic(finalTerm, 1, 20);

      if (songs && songs.length > 0) {
        // 转换为SearchResult类型
        const searchResults: SearchResult[] = songs.map(song => ({
          id: song.id,
          name: song.title,
          singer: song.artist,
          album: song.album,
          duration: song.duration,
          pic: song.imageUrl
        }));

        // 设置搜索结果
        set({
          searchResults,
          searchStatus: 'success'
        });

        // 添加到搜索历史
        get().addSearchHistory(finalTerm);
      } else {
        // 没有结果
        set({
          searchResults: [],
          searchStatus: 'success'
        });
      }
    } catch (error) {
      console.error('搜索失败:', error);
      set({
        searchResults: [],
        searchStatus: 'error',
        searchError: '搜索请求失败，请稍后重试'
      });
    }
  }
}));

export default useSearchStore;
