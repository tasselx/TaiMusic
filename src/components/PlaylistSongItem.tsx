import React from 'react';
import { DEFAULT_COVER } from '../constants';
import { formatDuration } from '../utils';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import CachedImage from './CachedImage';
import { useCurrentSongHighlight } from '../hooks/useCurrentSongHighlight';

interface PlaylistSongItemProps {
  song: any;
  index: number;
  onPlay: (song: any) => void;
  onRemove: (index: number) => void;
}

/**
 * 播放列表歌曲项组件
 * 显示单个歌曲的信息和操作按钮
 */
const PlaylistSongItem: React.FC<PlaylistSongItemProps> = ({
  song,
  index,
  onPlay,
  onRemove
}) => {
  const { addToFavorites, isFavorite } = useAudioPlayerStore();
  
  // 获取当前歌曲高亮信息
  const highlightInfo = useCurrentSongHighlight(song, song.id);

  return (
    <div
      key={song.id}
      className={`playlist-song-item ${highlightInfo.containerClassName}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onPlay(song)}
    >
      <div className="song-cover-container">
        <CachedImage
          src={song.coverUrl || DEFAULT_COVER}
          className="playlist-song-cover"
          alt={song.title}
        />
        <div className="song-play-overlay">
          {highlightInfo.isCurrentSong ? (
            highlightInfo.isPlaying ? (
              <i className="fas fa-pause"></i>
            ) : highlightInfo.isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-play"></i>
            )
          ) : (
            <i className="fas fa-play"></i>
          )}
        </div>
      </div>
      <div className="song-info">
        <div className="song-main-info">
          <span className={`playlist-song-title ${highlightInfo.titleClassName}`}>
            {highlightInfo.playingIndicator}
            {song.title}
          </span>
          <div className="song-meta">
            <span className="song-quality">{song.quality || 'SQ'}</span>
            <span className={`playlist-song-artist ${highlightInfo.artistClassName}`}>
              {song.artist}
            </span>
          </div>
        </div>
        <div className="playlist-song-duration">
          {formatDuration(typeof song.duration === 'string' ? song.duration : song.duration || 0)}
        </div>
        <div className="song-actions">
          <button
            className="song-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (isFavorite(song.id)) {
                // TODO: 从收藏移除
              } else {
                addToFavorites(song);
              }
            }}
            title={isFavorite(song.id) ? '取消收藏' : '收藏'}
          >
            <i className={`fas ${isFavorite(song.id) ? 'fa-heart' : 'fa-heart-o'}`}></i>
          </button>
          <button
            className="song-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              // 直接移除，无需确认
              onRemove(index);
            }}
            title="从列表移除"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongItem;
