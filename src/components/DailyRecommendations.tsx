import React, { useEffect, useState } from 'react';
import { useApiStore } from '../store';
import { DEFAULT_COVER, DAILY_RECOMMEND_COVER } from '../constants';
import { formatDuration } from '../utils';
import CachedImage from './CachedImage';


/**
 * 每日推荐组件
 * 显示从API获取的每日推荐歌曲列表
 */
const DailyRecommendations: React.FC = () => {
  // 从API Store获取数据和方法
  const { dailyRecommendations, fetchDailyRecommendations } = useApiStore();

  // 本地状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 组件挂载时获取每日推荐数据
  useEffect(() => {
    console.log('DailyRecommendations组件挂载，获取数据');
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        await fetchDailyRecommendations();
      } catch (error) {
        console.error('获取每日推荐失败:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchDailyRecommendations]);

  // 监听数据变化
  useEffect(() => {
    console.log('每日推荐数据更新:', dailyRecommendations);
    if (dailyRecommendations.length > 0) {
      setIsLoading(false);
    }
  }, [dailyRecommendations]);

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className="daily-recommendations-loading">
      <div className="daily-recommendations-header">
        <div className="daily-recommendations-icon">
          <i className="fas fa-calendar-day"></i>
        </div>
        <div className="daily-recommendations-info">
          <h3 className="daily-recommendations-title">每日推荐</h3>
          <p className="daily-recommendations-subtitle">正在为您精选今日歌曲...</p>
        </div>
      </div>
      <div className="daily-recommendations-skeleton">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="daily-recommendations-skeleton-item">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-artist"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染错误状态
  const renderErrorState = () => (
    <div className="daily-recommendations-error">
      <div className="daily-recommendations-header">
        <div className="daily-recommendations-icon error">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div className="daily-recommendations-info">
          <h3 className="daily-recommendations-title">每日推荐</h3>
          <p className="daily-recommendations-subtitle">暂时无法获取推荐内容</p>
        </div>
      </div>
      <div className="daily-recommendations-retry">
        <button
          className="daily-recommendations-retry-btn"
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            fetchDailyRecommendations();
          }}
        >
          <i className="fas fa-redo"></i>
          重试
        </button>
      </div>
    </div>
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="daily-recommendations-empty">
      <div className="daily-recommendations-header">
        <div className="daily-recommendations-icon">
          <i className="fas fa-calendar-day"></i>
        </div>
        <div className="daily-recommendations-info">
          <h3 className="daily-recommendations-title">每日推荐</h3>
          <p className="daily-recommendations-subtitle">根据您的喜好推荐</p>
        </div>
      </div>
      <div className="daily-recommendations-placeholder">
        <div className="playlist-item daily-recommendations-card">
          <div className="playlist-image-container">
            <CachedImage
              src={DAILY_RECOMMEND_COVER}
              className="playlist-image"
              alt="每日推荐歌曲"
            />
            <div className="daily-recommendations-overlay">
              <div className="daily-recommendations-play-btn">
                <i className="fas fa-play"></i>
              </div>
            </div>
          </div>
          <h3 className="playlist-title">每日30首</h3>
          <p className="playlist-info">根据您的喜好推荐</p>
        </div>
      </div>
    </div>
  );

  // 渲染歌曲列表
  const renderSongList = () => (
    <div className="daily-recommendations-content">
      <div className="daily-recommendations-header">
        <div className="daily-recommendations-icon">
          <i className="fas fa-calendar-day"></i>
        </div>
        <div className="daily-recommendations-info">
          <h3 className="daily-recommendations-title">每日推荐</h3>
          <p className="daily-recommendations-subtitle">
            为您精选 {dailyRecommendations.length} 首歌曲
          </p>
        </div>
        <div className="daily-recommendations-actions">
          <button className="daily-recommendations-play-all-btn">
            <i className="fas fa-play"></i>
            播放全部
          </button>
        </div>
      </div>

      <div className="daily-recommendations-list">
        {dailyRecommendations.map((song, index) => (
          <div key={song.id || index} className="daily-recommendations-item">
            <div className="daily-recommendations-item-number">
              {index + 1}
            </div>
            <div className="daily-recommendations-item-cover">
              <CachedImage
                src={song.imageUrl || DEFAULT_COVER}
                className="daily-recommendations-item-image"
                alt={song.title}
              />
              <div className="daily-recommendations-item-overlay">
                <div className="daily-recommendations-item-play-btn">
                  <i className="fas fa-play"></i>
                </div>
              </div>
            </div>
            <div className="daily-recommendations-item-info">
              <h4 className="daily-recommendations-item-title">{song.title}</h4>
              <p className="daily-recommendations-item-artist">{song.artist}</p>
            </div>
            <div className="daily-recommendations-item-album">
              {song.album}
            </div>
            <div className="daily-recommendations-item-duration">
              {formatDuration(song.duration)}
            </div>
            <div className="daily-recommendations-item-actions">
              <button className="daily-recommendations-item-action-btn">
                <i className="fas fa-heart"></i>
              </button>
              <button className="daily-recommendations-item-action-btn">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="daily-recommendations">
      {isLoading ? renderLoadingState() :
       hasError ? renderErrorState() :
       dailyRecommendations.length > 0 ? renderSongList() :
       renderEmptyState()}
    </div>
  );
};

export default DailyRecommendations;
