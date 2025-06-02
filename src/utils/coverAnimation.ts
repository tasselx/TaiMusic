/**
 * 封面动画工具函数
 * 根据播放状态生成对应的CSS类名
 */

/**
 * 根据播放状态生成播放器封面图片的CSS类名（专用于播放器组件）
 * @param isCurrentSong 是否为当前播放的歌曲
 * @param isPlaying 是否正在播放
 * @param baseClassName 基础CSS类名
 * @returns 完整的CSS类名字符串
 */
export const getPlayerCoverClassName = (
  isCurrentSong: boolean,
  isPlaying: boolean,
  baseClassName: string = ''
): string => {
  const classes = [baseClassName, 'player-cover-circular'];

  if (isCurrentSong) {
    if (isPlaying) {
      classes.push('player-cover-rotating');
    } else {
      classes.push('player-cover-paused');
    }
  }

  return classes.filter(Boolean).join(' ');
};

/**
 * 根据播放状态生成封面图片的CSS类名（通用版本，不包含动画）
 * @param isCurrentSong 是否为当前播放的歌曲
 * @param isPlaying 是否正在播放
 * @param baseClassName 基础CSS类名
 * @returns 完整的CSS类名字符串
 */
export const getCoverImageClassName = (
  isCurrentSong: boolean,
  isPlaying: boolean,
  baseClassName: string = ''
): string => {
  // 通用版本不包含圆形和动画效果
  return baseClassName;
};

/**
 * 检查是否应该显示旋转动画
 * @param isCurrentSong 是否为当前播放的歌曲
 * @param isPlaying 是否正在播放
 * @returns 是否应该旋转
 */
export const shouldRotate = (isCurrentSong: boolean, isPlaying: boolean): boolean => {
  return isCurrentSong && isPlaying;
};

/**
 * 获取封面容器的CSS类名（用于包含overlay的容器）
 * @param isCurrentSong 是否为当前播放的歌曲
 * @param isPlaying 是否正在播放
 * @param baseClassName 基础CSS类名
 * @returns CSS类名字符串
 */
export const getCoverContainerClassName = (
  isCurrentSong: boolean,
  isPlaying: boolean,
  baseClassName: string = ''
): string => {
  const classes = [baseClassName];
  
  if (isCurrentSong) {
    classes.push('current-song-cover');
  }
  
  return classes.filter(Boolean).join(' ');
};
