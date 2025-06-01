import { create } from 'zustand';
import { ToastItem, ToastType, ToastPosition, ToastOptions } from './types';

/**
 * Toast状态接口
 */
interface ToastState {
  // Toast列表
  toasts: ToastItem[];
  // 默认位置
  defaultPosition: ToastPosition;
  // 最大显示数量
  maxToasts: number;

  // 显示Toast
  showToast: (message: string, options?: ToastOptions) => string;
  // 隐藏指定Toast
  hideToast: (id: string) => void;
  // 清除所有Toast
  clearAllToasts: () => void;
  // 设置默认位置
  setDefaultPosition: (position: ToastPosition) => void;
  // 设置最大显示数量
  setMaxToasts: (max: number) => void;
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Toast状态管理
 */
const useToastStore = create<ToastState>((set, get) => ({
  // 初始状态
  toasts: [],
  defaultPosition: 'top-center',
  maxToasts: 5,

  // 显示Toast
  showToast: (message: string, options: ToastOptions = {}) => {
    const id = generateId();
    const {
      type = 'info',
      title,
      duration = 3000,
      closable = true
    } = options;

    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      duration,
      closable,
      createdAt: Date.now()
    };

    set((state) => {
      let newToasts = [...state.toasts, newToast];
      
      // 限制最大显示数量
      if (newToasts.length > state.maxToasts) {
        newToasts = newToasts.slice(-state.maxToasts);
      }

      return { toasts: newToasts };
    });

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }

    return id;
  },

  // 隐藏指定Toast
  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  // 清除所有Toast
  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // 设置默认位置
  setDefaultPosition: (position: ToastPosition) => {
    set({ defaultPosition: position });
  },

  // 设置最大显示数量
  setMaxToasts: (max: number) => {
    set({ maxToasts: Math.max(1, max) });
  }
}));

/**
 * 便捷方法
 */
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    useToastStore.getState().showToast(message, { ...options, type: 'success' }),
  
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    useToastStore.getState().showToast(message, { ...options, type: 'error' }),
  
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    useToastStore.getState().showToast(message, { ...options, type: 'warning' }),
  
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    useToastStore.getState().showToast(message, { ...options, type: 'info' }),
  
  hide: (id: string) => useToastStore.getState().hideToast(id),
  
  clear: () => useToastStore.getState().clearAllToasts()
};

export default useToastStore;
