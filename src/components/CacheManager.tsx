/**
 * 缓存管理组件
 * 显示缓存统计信息并提供清理功能
 */
import React, { useState, useEffect } from 'react';
import { getCacheStats, clearCache, clearExpiredCache, formatCacheSize } from '../utils/imageCache';

interface CacheManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

const CacheManager: React.FC<CacheManagerProps> = ({ isVisible, onClose }) => {
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(isVisible);
  const [isClosing, setIsClosing] = useState<boolean>(false);

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
    setIsClearing(true);
    try {
      await clearCache();
      await loadCacheStats();
      // 使用 Toast 通知用户操作成功
      console.log('所有缓存已清理');
    } catch (error) {
      console.error('清理缓存失败:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // 清理过期缓存
  const handleClearExpiredCache = async (days: number) => {
    setIsClearing(true);
    try {
      await clearExpiredCache(days);
      await loadCacheStats();
      // 使用 Toast 通知用户操作成功
      console.log(`${days}天前的缓存已清理`);
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // 处理可见性变化
  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setIsClosing(false);
      loadCacheStats();
    } else if (visible) {
      // 开始关闭动画
      setIsClosing(true);
      // 动画结束后隐藏组件
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300); // 动画持续时间

      return () => clearTimeout(timer);
    }
  }, [isVisible, visible]);

  // 如果不可见且没有正在关闭，则不渲染
  if (!visible) return null;

  // 处理关闭
  const handleClose = () => {
    onClose();
  };

  // 处理点击遮罩层关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return date.toLocaleString();
  };

  return (
    <>
      <div
        className={`cache-manager-overlay ${isClosing ? 'closing' : ''}`}
        onClick={handleOverlayClick}
      ></div>
      <div className={`cache-manager-container ${isClosing ? 'closing' : ''}`}>
        <div className="cache-manager-header">
          <h2 className="section-title">缓存管理</h2>
          <button className="cache-manager-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="cache-manager-content">
          {isLoading ? (
            <div className="loading-spinner"></div>
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
    </>
  );
};

export default CacheManager;
