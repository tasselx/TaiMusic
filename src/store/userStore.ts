import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo, LoadingState } from './types';

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
  logout: () => void;
}

/**
 * 用户状态管理
 * 使用persist中间件持久化存储用户信息
 */
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // 初始状态
      userInfo: null,
      loginStatus: 'idle',
      loginError: null,

      // 设置用户信息
      setUserInfo: (userInfo) => set({ userInfo }),

      // 设置登录状态
      setLoginStatus: (status, error) => set({
        loginStatus: status,
        loginError: error || null
      }),

      // 登出
      logout: () => {
        set({
          userInfo: null,
          loginStatus: 'idle',
          loginError: null
        });
      }
    }),
    {
      name: 'tai-music-user-storage', // 存储的键名
      partialize: (state) => ({ userInfo: state.userInfo }), // 只持久化userInfo字段
    }
  )
);

export default useUserStore;
