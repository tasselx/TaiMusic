import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useToastStore from '../store/toastStore';
import { ToastItem, ToastPosition } from '../store/types';

/**
 * 单个Toast项组件
 */
interface ToastItemProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const ToastItemComponent: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 自动关闭（如果设置了duration）
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          onClose(toast.id);
        }, 300); // 等待退出动画完成
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  // 简洁的文字显示，根据类型添加前缀符号
  const getTypePrefix = () => {
    switch (toast.type) {
      case 'success':
        return '✓ ';
      case 'error':
        return '✗ ';
      case 'warning':
        return '⚠ ';
      case 'info':
      default:
        return '';
    }
  };

  return (
    <div
      className={`toast-item toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
    >
      <span className="toast-text">
        {getTypePrefix()}{toast.message}
      </span>
    </div>
  );
};

/**
 * Toast容器组件
 */
interface ToastContainerProps {
  position?: ToastPosition;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-center'
}) => {
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  // 获取位置对应的CSS类名
  const getPositionClass = () => {
    return `toast-container-${position}`;
  };

  return createPortal(
    <div className={`toast-container ${getPositionClass()}`}>
      {toasts.map((toast) => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onClose={hideToast}
        />
      ))}
    </div>,
    document.body
  );
};

/**
 * useToast Hook - 便捷的Toast使用方法
 */
export const useToast = () => {
  const { showToast, hideToast, clearAllToasts } = useToastStore();

  return {
    showToast,
    hideToast,
    clearAllToasts,
    success: (message: string, options?: any) => 
      showToast(message, { ...options, type: 'success' }),
    error: (message: string, options?: any) => 
      showToast(message, { ...options, type: 'error' }),
    warning: (message: string, options?: any) => 
      showToast(message, { ...options, type: 'warning' }),
    info: (message: string, options?: any) => 
      showToast(message, { ...options, type: 'info' })
  };
};

export default ToastContainer;
