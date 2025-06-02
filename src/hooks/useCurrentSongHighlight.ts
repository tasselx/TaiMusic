/**
 * 当前播放歌曲高亮Hook
 * 提供统一的歌曲高亮状态和样式类名
 */
import React from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { Song } from '../utils/audioPlayer';

export interface SongHighlightInfo {
  isCurrentSong: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  containerClassName: string;
  titleClassName: string;
  artistClassName: string;
  playingIndicator: React.ReactNode;
}

/**
 * 获取歌曲高亮信息的Hook
 * @param song 歌曲对象
 * @param songId 歌曲ID（可选，如果song对象没有id字段）
 * @returns 高亮信息对象
 */
export const useCurrentSongHighlight = (
  song: Song | any, 
  songId?: string
): SongHighlightInfo => {
  const { 
    currentSong, 
    isPlaying, 
    isPaused, 
    isLoading 
  } = useAudioPlayerStore();

  // 确定歌曲ID
  const id = songId || song?.id || (song as any)?.hash;
  const currentId = currentSong?.id || (currentSong as any)?.hash;
  
  // 判断是否为当前播放歌曲
  const isCurrentSong = !!(id && currentId && id === currentId);

  // 生成样式类名
  const containerClassName = isCurrentSong ? 'current-playing-song' : '';
  const titleClassName = isCurrentSong ? 'current-playing-title' : '';
  const artistClassName = isCurrentSong ? 'current-playing-artist' : '';

  // 生成播放状态指示器
  const playingIndicator = isCurrentSong ? React.createElement(
    'span',
    { className: 'playing-indicator' },
    React.createElement(
      'i',
      {
        className: isLoading ? 'fas fa-spinner fa-spin' :
                   isPlaying ? 'fas fa-volume-up' :
                   isPaused ? 'fas fa-pause' : 'fas fa-music',
        title: isLoading ? '加载中' :
               isPlaying ? '正在播放' :
               isPaused ? '已暂停' : '当前歌曲'
      }
    )
  ) : null;

  return {
    isCurrentSong,
    isPlaying: isCurrentSong && isPlaying,
    isPaused: isCurrentSong && isPaused,
    isLoading: isCurrentSong && isLoading,
    containerClassName,
    titleClassName,
    artistClassName,
    playingIndicator
  };
};

/**
 * 获取简化的高亮类名
 * @param song 歌曲对象
 * @param songId 歌曲ID（可选）
 * @returns 容器类名字符串
 */
export const useCurrentSongClass = (song: Song | any, songId?: string): string => {
  const { isCurrentSong } = useCurrentSongHighlight(song, songId);
  return isCurrentSong ? 'current-playing-song' : '';
};

/**
 * 检查是否为当前播放歌曲
 * @param song 歌曲对象
 * @param songId 歌曲ID（可选）
 * @returns 是否为当前播放歌曲
 */
export const useIsCurrentSong = (song: Song | any, songId?: string): boolean => {
  const { currentSong } = useAudioPlayerStore();

  const id = songId || song?.id || (song as any)?.hash;
  const currentId = currentSong?.id || (currentSong as any)?.hash;
  
  return !!(id && currentId && id === currentId);
};

export default useCurrentSongHighlight;
