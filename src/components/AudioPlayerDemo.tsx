/**
 * 音频播放器演示组件
 * 用于测试和演示新的音频播放器功能
 */
import React, { useEffect } from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { Song } from '../utils/audioPlayer';
import { DEFAULT_COVER } from '../constants';

// 演示歌曲数据
const demoSongs: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200, // 3:20 in seconds
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: DEFAULT_COVER,
    quality: 'HQ'
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233, // 3:53 in seconds
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: DEFAULT_COVER,
    quality: 'SQ'
  },
  {
    id: '3',
    title: 'Dance Monkey',
    artist: 'Tones and I',
    album: 'The Kids Are Coming',
    duration: 209, // 3:29 in seconds
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: DEFAULT_COVER,
    quality: 'HQ'
  }
];

const AudioPlayerDemo: React.FC = () => {
  const {
    queue,
    currentSong,
    isPlaying,
    playMode,
    volume,
    cacheStats,
    setQueue,
    play,
    addToQueue,
    clearQueue,
    updateCacheStats,
    clearCache
  } = useAudioPlayerStore();

  // 初始化演示数据
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  const handleLoadDemoSongs = () => {
    setQueue(demoSongs);
  };

  const handlePlaySong = (song: Song) => {
    play(song);
  };

  const handleAddSong = (song: Song) => {
    addToQueue(song);
  };

  const handleClearCache = async () => {
    if (window.confirm('确定要清空所有音频缓存吗？')) {
      await clearCache();
    }
  };

  return (
    <div className="audio-player-demo">
      <div className="demo-section">
        <h3 className="demo-title">音频播放器演示</h3>
        
        {/* 控制按钮 */}
        <div className="demo-controls">
          <button 
            className="demo-btn primary"
            onClick={handleLoadDemoSongs}
          >
            加载演示歌曲
          </button>
          <button 
            className="demo-btn"
            onClick={clearQueue}
            disabled={queue.length === 0}
          >
            清空播放列表
          </button>
          <button 
            className="demo-btn"
            onClick={handleClearCache}
          >
            清空缓存
          </button>
        </div>

        {/* 当前状态 */}
        <div className="demo-status">
          <div className="status-item">
            <span className="status-label">当前歌曲:</span>
            <span className="status-value">
              {currentSong ? `${currentSong.title} - ${currentSong.artist}` : '无'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">播放状态:</span>
            <span className="status-value">{isPlaying ? '播放中' : '暂停'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">播放模式:</span>
            <span className="status-value">{playMode}</span>
          </div>
          <div className="status-item">
            <span className="status-label">音量:</span>
            <span className="status-value">{Math.round(volume * 100)}%</span>
          </div>
          <div className="status-item">
            <span className="status-label">队列长度:</span>
            <span className="status-value">{queue.length} 首</span>
          </div>
        </div>

        {/* 缓存统计 */}
        {cacheStats && (
          <div className="demo-cache-stats">
            <h4>缓存统计</h4>
            <div className="cache-stats-grid">
              <div className="cache-stat-item">
                <span className="cache-stat-label">缓存文件数:</span>
                <span className="cache-stat-value">{cacheStats.totalFiles}</span>
              </div>
              <div className="cache-stat-item">
                <span className="cache-stat-label">缓存大小:</span>
                <span className="cache-stat-value">
                  {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="cache-stat-item">
                <span className="cache-stat-label">使用率:</span>
                <span className="cache-stat-value">
                  {cacheStats.usagePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 演示歌曲列表 */}
        <div className="demo-songs">
          <h4>演示歌曲</h4>
          <div className="demo-song-list">
            {demoSongs.map((song) => (
              <div key={song.id} className="demo-song-item">
                <div className="demo-song-info">
                  <span className="demo-song-title">{song.title}</span>
                  <span className="demo-song-artist">{song.artist}</span>
                </div>
                <div className="demo-song-actions">
                  <button
                    className="demo-song-btn"
                    onClick={() => handlePlaySong(song)}
                  >
                    播放
                  </button>
                  <button
                    className="demo-song-btn"
                    onClick={() => handleAddSong(song)}
                  >
                    添加到队列
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerDemo;
