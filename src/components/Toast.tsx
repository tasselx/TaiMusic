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

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // 等待退出动画完成
  };

  // 获取Toast类型对应的图标
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'info':
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div 
      className={`toast-item toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        {toast.title && (
          <div className="toast-title">{toast.title}</div>
        )}
        <div className="toast-message">{toast.message}</div>
      </div>
      
      {toast.closable && (
        <button 
          className="toast-close-btn"
          onClick={handleClose}
          aria-label="关闭通知"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
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
  position = 'top-right' 
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
