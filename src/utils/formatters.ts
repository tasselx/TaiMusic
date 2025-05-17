/**
 * 格式化工具函数
 */

/**
 * 格式化封面图片URL，替换{size}参数
 * @param url 原始封面URL，例如 "http://imge.kugou.com/stdmusic/{size}/20250101/20250101073202450754.jpg"
 * @param size 图片尺寸，默认为150
 * @returns 替换size后的URL
 */
export const formatCoverUrl = (url?: string, size: number = 150): string => {
  // 如果URL为空，返回默认封面
  if (!url) return '';

  // 替换{size}参数
  return url.replace('{size}', size.toString());
};

/**
 * 将时长格式化为两位的分:秒格式
 * @param duration 时长（秒数或字符串）
 * @returns 格式化后的时长字符串，例如 "03:45"
 */
export const formatDuration = (duration?: number | string): string => {
  // 如果是无效值，返回默认格式
  if (!duration) return '--:--';

  // 如果已经是格式化的字符串（包含冒号），直接返回
  if (typeof duration === 'string' && duration.includes(':')) {
    // 检查是否已经是两位格式
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parts[0].padStart(2, '0');
      const seconds = parts[1].padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
    return duration;
  }

  // 将字符串转换为数字
  let seconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;

  // 如果无法解析为数字，返回默认格式
  if (isNaN(seconds)) return '--:--';

  // 计算分钟和秒数
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // 格式化为两位数
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};
