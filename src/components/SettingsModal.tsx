import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCacheStats, clearCache, clearExpiredCache, formatCacheSize } from '../utils/imageCache';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 设置弹窗组件
 * 包含缓存管理和其他应用设置
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 缓存管理状态
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
      // 加载缓存统计信息
      loadCacheStats();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  // 点击遮罩层关闭弹窗
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === modalRef.current) {
      onClose();
    }
  };

  // 加载缓存统计信息
  const loadCacheStats = async () => {
    setIsLoading(true);
    try {
      const stats = await getCacheStats();
      setCacheCount(stats.count);
      setCacheSize(stats.size);
      setLastUpdated(stats.lastUpdated);
    } catch (error) {
      console.error('加载缓存统计信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 清理所有缓存
  const handleClearAllCache = async () => {
    if (window.confirm('确定要清理所有缓存吗？')) {
      setIsClearing(true);
      try {
        await clearCache();
        await loadCacheStats();
      } catch (error) {
        console.error('清理缓存失败:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // 清理过期缓存
  const handleClearExpiredCache = async (days: number) => {
    if (window.confirm(`确定要清理${days}天前的缓存吗？`)) {
      setIsClearing(true);
      try {
        await clearExpiredCache(days);
        await loadCacheStats();
      } catch (error) {
        console.error('清理过期缓存失败:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return date.toLocaleString();
  };

  // 如果不可见，不渲染组件
  if (!isVisible) {
    return null;
  }

  // 使用Portal将模态弹窗渲染到body级别，避免层叠上下文问题
  return createPortal(
    <div
      ref={modalRef}
      className="settings-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        className="settings-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">设置</h2>
          <button
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="关闭设置"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="settings-modal-body">
          {/* 缓存管理区域 */}
          <div className="settings-section">
            <h3 className="settings-section-title">
              <i className="fas fa-database"></i>
              缓存管理
            </h3>

            <div className="settings-section-content">
              {isLoading ? (
                <div className="settings-loading">
                  <div className="loading-spinner"></div>
                  <span>加载中...</span>
                </div>
              ) : (
                <>
                  <div className="cache-stats">
                    <div className="cache-stat-item">
                      <span className="cache-stat-label">缓存数量:</span>
                      <span className="cache-stat-value">{cacheCount} 个</span>
                    </div>
                    <div className="cache-stat-item">
                      <span className="cache-stat-label">缓存大小:</span>
                      <span className="cache-stat-value">{formatCacheSize(cacheSize)}</span>
                    </div>
                    <div className="cache-stat-item">
                      <span className="cache-stat-label">最后更新:</span>
                      <span className="cache-stat-value">{formatDate(lastUpdated)}</span>
                    </div>
                  </div>

                  <div className="cache-actions">
                    <button
                      className="cache-action-btn"
                      onClick={() => handleClearExpiredCache(7)}
                      disabled={isClearing || cacheCount === 0}
                    >
                      清理7天前的缓存
                    </button>
                    <button
                      className="cache-action-btn"
                      onClick={() => handleClearExpiredCache(30)}
                      disabled={isClearing || cacheCount === 0}
                    >
                      清理30天前的缓存
                    </button>
                    <button
                      className="cache-action-btn danger"
                      onClick={handleClearAllCache}
                      disabled={isClearing || cacheCount === 0}
                    >
                      清理所有缓存
                    </button>
                  </div>

                  {isClearing && (
                    <div className="clearing-indicator">
                      <div className="loading-spinner"></div>
                      <span>正在清理缓存...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 预留其他设置区域 */}
          <div className="settings-section">
            <h3 className="settings-section-title">
              <i className="fas fa-palette"></i>
              外观设置
            </h3>
            <div className="settings-section-content">
              <p className="settings-placeholder">主题设置功能即将推出...</p>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">
              <i className="fas fa-music"></i>
              播放设置
            </h3>
            <div className="settings-section-content">
              <p className="settings-placeholder">音质设置功能即将推出...</p>
            </div>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="settings-modal-footer">
          <button
            className="settings-modal-cancel-btn"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="settings-modal-confirm-btn"
            onClick={onClose}
          >
            确定
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
