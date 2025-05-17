import React, { useEffect } from 'react';
import { useApiStore } from '../store';
import { DEFAULT_COVER, DAILY_RECOMMEND_COVER } from '../constants';
import { formatDuration, formatCoverUrl } from '../utils';
import CachedImage from './CachedImage';

/**
 * 每日推荐组件
 * 显示从API获取的每日推荐歌曲列表
 */
const DailyRecommendations: React.FC = () => {
  // 从API Store获取数据和方法
  const { dailyRecommendations, fetchDailyRecommendations } = useApiStore();

  // 组件挂载时获取每日推荐数据
  useEffect(() => {
    console.log('DailyRecommendations组件挂载，获取数据');
    fetchDailyRecommendations();
  }, [fetchDailyRecommendations]);

  // 监听数据变化
  useEffect(() => {
    console.log('每日推荐数据更新:', dailyRecommendations);
  }, [dailyRecommendations]);

  return (
    <div className="daily-recommendations">
      <h2 className="section-title">每日推荐</h2>
      {dailyRecommendations.length > 0 ? (
        <div className="song-list">
          <div className="song-list-header">
            <div className="song-number">#</div>
            <div style={{ flex: 1 }}>歌曲标题</div>
            <div className="song-artist">歌手</div>
            <div className="song-album">专辑</div>
            <div className="song-duration">时长</div>
          </div>
          <div className="song-list-body">
            {dailyRecommendations.map((song, index) => (
              <div key={song.id || index} className="song-item">
                <div className="song-number">{index + 1}</div>
                <div className="song-title-container">
                  <CachedImage
                    src={song.sizable_cover ? formatCoverUrl(song.sizable_cover) : (song.imageUrl || DEFAULT_COVER)}
                    className="song-image"
                    alt={song.title}
                  />
                  <span className="song-title">{song.title}</span>
                </div>
                <div className="song-artist">{song.artist}</div>
                <div className="song-album">{song.album}</div>
                <div className="song-duration">{formatDuration(song.duration)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="playlist-grid">
          <div className="playlist-item">
            <div className="playlist-image-container">
              <CachedImage
                src={DAILY_RECOMMEND_COVER}
                className="playlist-image"
                alt="每日推荐歌曲"
              />
            </div>
            <h3 className="playlist-title">每日30首</h3>
            <p className="playlist-info">根据您的喜好推荐</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRecommendations;
