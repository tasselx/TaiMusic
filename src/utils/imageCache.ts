/**
 * 图片缓存管理器
 * 提供图片缓存、获取、清理和统计功能
 */
import localforage from 'localforage';

// 初始化缓存存储
const imageCache = localforage.createInstance({
  name: 'taiMusic',
  storeName: 'imageCache',
  description: '图片缓存存储'
});

// 缓存统计信息
interface CacheStats {
  count: number;
  size: number; // 字节
  lastUpdated: Date;
}

// 缓存项元数据
interface CacheItemMetadata {
  url: string;
  size: number; // 字节
  timestamp: number;
  type: string;
}

// 缓存键前缀
const CACHE_PREFIX = 'img_';
const STATS_KEY = 'cache_stats';

/**
 * 生成缓存键
 * @param url 图片URL
 * @returns 缓存键
 */
const getCacheKey = (url: string): string => {
  return `${CACHE_PREFIX}${btoa(url).replace(/[+/=]/g, '_')}`;
};

/**
 * 获取或创建缓存统计信息
 * @returns 缓存统计信息
 */
const getStats = async (): Promise<CacheStats> => {
  try {
    const stats = await imageCache.getItem<CacheStats>(STATS_KEY);
    return stats || { count: 0, size: 0, lastUpdated: new Date() };
  } catch (error) {
    console.error('获取缓存统计信息失败:', error);
    return { count: 0, size: 0, lastUpdated: new Date() };
  }
};

/**
 * 更新缓存统计信息
 * @param stats 缓存统计信息
 */
const updateStats = async (stats: CacheStats): Promise<void> => {
  try {
    stats.lastUpdated = new Date();
    await imageCache.setItem(STATS_KEY, stats);
  } catch (error) {
    console.error('更新缓存统计信息失败:', error);
  }
};

/**
 * 缓存图片
 * @param url 图片URL
 * @param blob 图片Blob数据
 */
export const cacheImage = async (url: string, blob: Blob): Promise<void> => {
  try {
    const key = getCacheKey(url);
    const metadata: CacheItemMetadata = {
      url,
      size: blob.size,
      timestamp: Date.now(),
      type: blob.type
    };
    
    // 存储图片数据和元数据
    await imageCache.setItem(key, blob);
    await imageCache.setItem(`${key}_meta`, metadata);
    
    // 更新统计信息
    const stats = await getStats();
    stats.count += 1;
    stats.size += blob.size;
    await updateStats(stats);
  } catch (error) {
    console.error('缓存图片失败:', error);
  }
};

/**
 * 从缓存获取图片
 * @param url 图片URL
 * @returns 图片Blob数据或null
 */
export const getCachedImage = async (url: string): Promise<Blob | null> => {
  try {
    const key = getCacheKey(url);
    const blob = await imageCache.getItem<Blob>(key);
    
    if (blob) {
      // 更新元数据的时间戳
      const metadata = await imageCache.getItem<CacheItemMetadata>(`${key}_meta`);
      if (metadata) {
        metadata.timestamp = Date.now();
        await imageCache.setItem(`${key}_meta`, metadata);
      }
    }
    
    return blob;
  } catch (error) {
    console.error('获取缓存图片失败:', error);
    return null;
  }
};

/**
 * 获取缓存统计信息
 * @returns 缓存统计信息
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  return await getStats();
};

/**
 * 清理所有缓存
 */
export const clearCache = async (): Promise<void> => {
  try {
    await imageCache.clear();
    await updateStats({ count: 0, size: 0, lastUpdated: new Date() });
  } catch (error) {
    console.error('清理缓存失败:', error);
  }
};

/**
 * 清理过期缓存（超过指定天数的缓存）
 * @param days 过期天数，默认为7天
 */
export const clearExpiredCache = async (days: number = 7): Promise<void> => {
  try {
    const now = Date.now();
    const expiryTime = now - (days * 24 * 60 * 60 * 1000);
    const keys = await imageCache.keys();
    
    let removedCount = 0;
    let removedSize = 0;
    
    for (const key of keys) {
      // 跳过统计信息键
      if (key === STATS_KEY) continue;
      
      // 只处理元数据键
      if (key.endsWith('_meta')) {
        const metadata = await imageCache.getItem<CacheItemMetadata>(key);
        
        if (metadata && metadata.timestamp < expiryTime) {
          const imageKey = key.replace('_meta', '');
          
          // 删除图片和元数据
          await imageCache.removeItem(imageKey);
          await imageCache.removeItem(key);
          
          removedCount += 1;
          removedSize += metadata.size;
        }
      }
    }
    
    // 更新统计信息
    if (removedCount > 0) {
      const stats = await getStats();
      stats.count -= removedCount;
      stats.size -= removedSize;
      await updateStats(stats);
    }
  } catch (error) {
    console.error('清理过期缓存失败:', error);
  }
};

/**
 * 格式化缓存大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export const formatCacheSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};
