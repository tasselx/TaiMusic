import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoadingState } from './types';

/**
 * 用户状态接口
 */
interface UserState {
  // 用户信息
  user: User | null;
  // 登录状态
  loginStatus: LoadingState;
  // 登录错误信息
  loginError: string | null;
  
  // 设置用户信息
  setUser: (user: User | null) => void;
  // 设置登录状态
  setLoginStatus: (status: LoadingState, error?: string) => void;
  // 登录
  login: (token: string, userId: string) => Promise<void>;
  // 登出
  logout: () => void;
  // 检查登录状态
  checkLoginStatus: () => Promise<boolean>;
}

/**
 * 用户状态管理
 * 使用persist中间件持久化存储用户信息
 */
const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      loginStatus: 'idle',
      loginError: null,
      
      // 设置用户信息
      setUser: (user) => set({ user }),
      
      // 设置登录状态
      setLoginStatus: (status, error = null) => set({ 
        loginStatus: status, 
        loginError: error 
      }),
      
      // 登录
      login: async (token, userId) => {
        // 设置登录中状态
        set({ loginStatus: 'loading', loginError: null });
        
        try {
          // 这里可以添加验证token的逻辑
          // 模拟API请求获取用户信息
          const response = await fetch(`/api/user/detail?userid=${userId}`);
          const data = await response.json();
          
          if (data && data.data) {
            // 登录成功，设置用户信息
            set({ 
              user: {
                id: userId,
                username: data.data.nickname || '用户' + userId.substring(0, 4),
                avatar: data.data.avatar || 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
                isLoggedIn: true,
                token
              },
              loginStatus: 'success'
            });
            return;
          }
          
          // 如果没有获取到用户信息，使用默认值
          set({ 
            user: {
              id: userId,
              username: '用户' + userId.substring(0, 4),
              avatar: 'https://ai-public.mastergo.com/ai/img_res/480bba3a0094fc71a4b8e1d43800f97f.jpg',
              isLoggedIn: true,
              token
            },
            loginStatus: 'success'
          });
        } catch (error) {
          console.error('登录失败:', error);
          set({ 
            loginStatus: 'error',
            loginError: '登录失败，请稍后重试'
          });
        }
      },
      
      // 登出
      logout: () => {
        set({ 
          user: null,
          loginStatus: 'idle',
          loginError: null
        });
      },
      
      // 检查登录状态
      checkLoginStatus: async () => {
        const { user } = get();
        
        if (!user || !user.token) {
          return false;
        }
        
        try {
          // 验证token是否有效
          const response = await fetch('/api/user/status', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          
          if (response.ok) {
            return true;
          }
          
          // token无效，登出
          get().logout();
          return false;
        } catch (error) {
          console.error('验证登录状态失败:', error);
          return !!user.isLoggedIn; // 如果请求失败，返回当前登录状态
        }
      }
    }),
    {
      name: 'tai-music-user-storage', // 存储的键名
      partialize: (state) => ({ user: state.user }), // 只持久化user字段
    }
  )
);

export default useUserStore;
