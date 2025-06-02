import React from 'react';
import { DEFAULT_COVER } from '../constants';
import { formatDuration } from '../utils';
import CachedImage from './CachedImage';
import { useCurrentSongHighlight } from '../hooks/useCurrentSongHighlight';

interface DailyRecommendationItemProps {
  song: any;
  index: number;
  isLoading: boolean;
  onPlay: (song: any) => void;
}

/**
 * 每日推荐歌曲项组件
 * 显示单个歌曲的信息和播放控制
 */
const DailyRecommendationItem: React.FC<DailyRecommendationItemProps> = ({
  song,
  index,
  isLoading,
  onPlay
}) => {
  // 获取当前歌曲高亮信息
  const highlightInfo = useCurrentSongHighlight(song, String(song.id));

  return (
    <div
      className={`daily-recommendations-item ${highlightInfo.containerClassName}`}
      onClick={() => onPlay(song)}
    >
      <div className="daily-recommendations-item-number">
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : highlightInfo.isCurrentSong ? (
          highlightInfo.playingIndicator
        ) : (
          index + 1
        )}
      </div>
      <div className="daily-recommendations-item-cover">
        <CachedImage
          src={song.imageUrl || DEFAULT_COVER}
          className="daily-recommendations-item-image"
          alt={song.title}
        />
        <div className="daily-recommendations-item-overlay">
          <div className="daily-recommendations-item-play-btn">
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : highlightInfo.isCurrentSong && highlightInfo.isPlaying ? (
              <i className="fas fa-pause"></i>
            ) : (
              <i className="fas fa-play"></i>
            )}
          </div>
        </div>
      </div>
      <div className="daily-recommendations-item-info">
        <h4 className={`daily-recommendations-item-title ${highlightInfo.titleClassName}`}>
          {song.title}
        </h4>
        <p className={`daily-recommendations-item-artist ${highlightInfo.artistClassName}`}>
          {song.artist}
        </p>
      </div>
      <div className="daily-recommendations-item-album">
        {song.album}
      </div>
      <div className="daily-recommendations-item-duration">
        {formatDuration(song.duration)}
      </div>
      <div className="daily-recommendations-item-actions">
        <button
          className="daily-recommendations-item-action-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-heart"></i>
        </button>
        <button
          className="daily-recommendations-item-action-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </div>
  );
};

export default DailyRecommendationItem;
