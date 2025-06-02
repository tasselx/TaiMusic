import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo, LoadingState } from './types';
import useAudioPlayerStore from './audioPlayerStore';
import { clearCache as clearImageCache } from '../utils/imageCache';

/**
 * 用户状态接口
 */
interface UserState {
  // 用户信息
  userInfo: UserInfo | null;
  // 登录状态
  loginStatus: LoadingState;
  // 登录错误信息
  loginError: string | null;

  // 设置用户信息
  setUserInfo: (userInfo: UserInfo | null) => void;
  // 设置登录状态
  setLoginStatus: (status: LoadingState, error?: string) => void;
  // 登出
  logout: (clearAllCache?: boolean) => void;
  // 登录成功回调
  onLoginSuccess?: () => void;
  // 设置登录成功回调
  setOnLoginSuccess: (callback?: () => void) => void;
}

/**
 * 用户状态管理
 * 使用persist中间件持久化存储用户信息
 */
const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      userInfo: null,
      loginStatus: 'idle',
      loginError: null,

      // 设置用户信息
      setUserInfo: (userInfo) => {
        const prevUserInfo = get().userInfo;
        set({ userInfo });

        // 如果之前未登录，现在登录成功，触发登录成功回调
        if (!prevUserInfo?.isLoggedIn && userInfo?.isLoggedIn && get().onLoginSuccess) {
          console.log('🎉 检测到用户登录成功，触发回调');
          get().onLoginSuccess?.();
        }
      },

      // 设置登录状态
      setLoginStatus: (status, error) => set({
        loginStatus: status,
        loginError: error || null
      }),

      // 登出
      logout: async (clearAllCache = false) => {
        // 清理用户信息
        set({
          userInfo: null,
          loginStatus: 'idle',
          loginError: null
        });

        // 清理用户相关的播放数据
        try {
          const audioPlayerStore = useAudioPlayerStore.getState();
          // 清理播放历史
          audioPlayerStore.clearHistory();
          // 清理收藏列表
          audioPlayerStore.clearFavorites();
          // 停止当前播放
          audioPlayerStore.stop();
          // 清空播放队列
          audioPlayerStore.clearQueue();

          // 如果需要清理所有缓存
          if (clearAllCache) {
            // 清理音频缓存
            await audioPlayerStore.clearCache();
            // 清理图片缓存
            await clearImageCache();
            console.log('✅ 所有缓存已清理');
          } else {
            console.log('✅ 用户相关数据已清理');
          }
        } catch (error) {
          console.error('❌ 清理缓存时出错:', error);
        }
      },

      // 设置登录成功回调
      setOnLoginSuccess: (callback) => set({ onLoginSuccess: callback })
    }),
    {
      name: 'tai-music-user-storage', // 存储的键名
      partialize: (state) => ({ userInfo: state.userInfo }), // 只持久化userInfo字段
    }
  )
);

export default useUserStore;
