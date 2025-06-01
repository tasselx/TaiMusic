/**
 * 音频缓存管理器
 * 基于IndexedDB实现音频文件的本地缓存，支持LRU策略和缓存统计
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import CryptoJS from 'crypto-js';

// 缓存数据库结构定义
interface AudioCacheDB extends DBSchema {
  audioFiles: {
    key: string; // 文件URL的哈希值
    value: {
      id: string;
      url: string;
      blob: Blob;
      size: number;
      lastAccessed: number;
      createdAt: number;
      metadata?: {
        title?: string;
        artist?: string;
        duration?: number;
      };
    };
  };
  cacheStats: {
    key: string;
    value: {
      id: string;
      totalSize: number;
      totalFiles: number;
      lastCleanup: number;
    };
  };
}

// 缓存配置
interface CacheConfig {
  maxSize: number; // 最大缓存大小（字节）
  maxFiles: number; // 最大文件数量
  dbName: string;
  dbVersion: number;
}

// 缓存统计信息
export interface CacheStats {
  totalSize: number;
  totalFiles: number;
  maxSize: number;
  maxFiles: number;
  usagePercentage: number;
  lastCleanup: number;
}

// 缓存项信息
export interface CacheItem {
  id: string;
  url: string;
  size: number;
  lastAccessed: number;
  createdAt: number;
  metadata?: {
    title?: string;
    artist?: string;
    duration?: number;
  };
}

class AudioCacheManager {
  private db: IDBPDatabase<AudioCacheDB> | null = null;
  private config: CacheConfig;
  private isInitialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 500 * 1024 * 1024, // 默认500MB
      maxFiles: 1000, // 默认最多1000个文件
      dbName: 'TaiMusicAudioCache',
      dbVersion: 1,
      ...config
    };
  }

  /**
   * 初始化缓存数据库
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<AudioCacheDB>(this.config.dbName, this.config.dbVersion, {
        upgrade(db) {
          // 创建音频文件存储
          if (!db.objectStoreNames.contains('audioFiles')) {
            const audioStore = db.createObjectStore('audioFiles', { keyPath: 'id' });
            audioStore.createIndex('lastAccessed', 'lastAccessed');
            audioStore.createIndex('createdAt', 'createdAt');
            audioStore.createIndex('size', 'size');
          }

          // 创建缓存统计存储
          if (!db.objectStoreNames.contains('cacheStats')) {
            db.createObjectStore('cacheStats', { keyPath: 'id' });
          }
        }
      });

      this.isInitialized = true;
      console.log('音频缓存管理器初始化成功');
    } catch (error) {
      console.error('音频缓存管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 生成URL的哈希值作为缓存键
   */
  private generateCacheKey(url: string): string {
    return CryptoJS.MD5(url).toString();
  }

  /**
   * 检查音频文件是否已缓存
   */
  async isCached(url: string): Promise<boolean> {
    await this.initialize();
    if (!this.db) return false;

    const key = this.generateCacheKey(url);
    const item = await this.db.get('audioFiles', key);
    return !!item;
  }

  /**
   * 获取缓存的音频文件
   */
  async getCachedAudio(url: string): Promise<Blob | null> {
    await this.initialize();
    if (!this.db) return null;

    const key = this.generateCacheKey(url);
    const item = await this.db.get('audioFiles', key);
    
    if (item) {
      // 更新最后访问时间
      item.lastAccessed = Date.now();
      await this.db.put('audioFiles', item);
      return item.blob;
    }

    return null;
  }

  /**
   * 缓存音频文件
   */
  async cacheAudio(url: string, blob: Blob, metadata?: CacheItem['metadata']): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const key = this.generateCacheKey(url);
    const now = Date.now();
    
    const cacheItem = {
      id: key,
      url,
      blob,
      size: blob.size,
      lastAccessed: now,
      createdAt: now,
      metadata
    };

    // 检查是否需要清理空间
    await this.ensureSpace(blob.size);

    // 存储文件
    await this.db.put('audioFiles', cacheItem);

    // 更新统计信息
    await this.updateStats();

    console.log(`音频文件已缓存: ${url} (${this.formatSize(blob.size)})`);
  }

  /**
   * 确保有足够的缓存空间
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    if (!this.db) return;

    const stats = await this.getStats();
    
    // 检查是否超出大小限制
    if (stats.totalSize + requiredSize > this.config.maxSize) {
      await this.cleanupBySize(stats.totalSize + requiredSize - this.config.maxSize);
    }

    // 检查是否超出文件数量限制
    if (stats.totalFiles >= this.config.maxFiles) {
      await this.cleanupByCount(stats.totalFiles - this.config.maxFiles + 1);
    }
  }

  /**
   * 按大小清理缓存（LRU策略）
   */
  private async cleanupBySize(sizeToFree: number): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('audioFiles', 'readwrite');
    const store = tx.objectStore('audioFiles');
    const index = store.index('lastAccessed');
    
    let freedSize = 0;
    const cursor = await index.openCursor();
    
    while (cursor && freedSize < sizeToFree) {
      const item = cursor.value;
      freedSize += item.size;
      await cursor.delete();
      console.log(`清理缓存文件: ${item.url} (${this.formatSize(item.size)})`);
      await cursor.continue();
    }

    await tx.done;
  }

  /**
   * 按数量清理缓存（LRU策略）
   */
  private async cleanupByCount(countToRemove: number): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('audioFiles', 'readwrite');
    const store = tx.objectStore('audioFiles');
    const index = store.index('lastAccessed');
    
    let removedCount = 0;
    const cursor = await index.openCursor();
    
    while (cursor && removedCount < countToRemove) {
      const item = cursor.value;
      await cursor.delete();
      console.log(`清理缓存文件: ${item.url} (${this.formatSize(item.size)})`);
      removedCount++;
      await cursor.continue();
    }

    await tx.done;
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    await this.initialize();
    if (!this.db) {
      return {
        totalSize: 0,
        totalFiles: 0,
        maxSize: this.config.maxSize,
        maxFiles: this.config.maxFiles,
        usagePercentage: 0,
        lastCleanup: 0
      };
    }

    const tx = this.db.transaction('audioFiles', 'readonly');
    const store = tx.objectStore('audioFiles');
    
    let totalSize = 0;
    let totalFiles = 0;
    
    const cursor = await store.openCursor();
    while (cursor) {
      totalSize += cursor.value.size;
      totalFiles++;
      await cursor.continue();
    }

    const statsRecord = await this.db.get('cacheStats', 'main');
    const lastCleanup = statsRecord?.lastCleanup || 0;

    return {
      totalSize,
      totalFiles,
      maxSize: this.config.maxSize,
      maxFiles: this.config.maxFiles,
      usagePercentage: (totalSize / this.config.maxSize) * 100,
      lastCleanup
    };
  }

  /**
   * 更新统计信息
   */
  private async updateStats(): Promise<void> {
    if (!this.db) return;

    const stats = await this.getStats();
    await this.db.put('cacheStats', {
      id: 'main',
      totalSize: stats.totalSize,
      totalFiles: stats.totalFiles,
      lastCleanup: Date.now()
    });
  }

  /**
   * 清空所有缓存
   */
  async clearAll(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const tx = this.db.transaction(['audioFiles', 'cacheStats'], 'readwrite');
    await tx.objectStore('audioFiles').clear();
    await tx.objectStore('cacheStats').clear();
    await tx.done;

    console.log('所有音频缓存已清空');
  }

  /**
   * 删除特定URL的缓存
   */
  async removeCache(url: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const key = this.generateCacheKey(url);
    await this.db.delete('audioFiles', key);
    await this.updateStats();
  }

  /**
   * 获取所有缓存项
   */
  async getAllCacheItems(): Promise<CacheItem[]> {
    await this.initialize();
    if (!this.db) return [];

    const items = await this.db.getAll('audioFiles');
    return items.map(item => ({
      id: item.id,
      url: item.url,
      size: item.size,
      lastAccessed: item.lastAccessed,
      createdAt: item.createdAt,
      metadata: item.metadata
    }));
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// 导出单例实例
export const audioCacheManager = new AudioCacheManager();
export default AudioCacheManager;
