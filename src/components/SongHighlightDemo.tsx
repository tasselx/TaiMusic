/**
 * 歌曲高亮效果演示组件
 * 用于展示正在播放歌曲的视觉反馈功能
 */
import React from 'react';
import { useAudioPlayerStore } from '../store/audioPlayerStore';
import { useCurrentSongHighlight } from '../hooks/useCurrentSongHighlight';
import { formatDuration } from '../utils';
import { DEFAULT_COVER } from '../constants';
import CachedImage from './CachedImage';

const SongHighlightDemo: React.FC = () => {
  const { currentSong, isPlaying, isPaused, isLoading, queue } = useAudioPlayerStore();

  // 演示歌曲数据
  const demoSongs = [
    {
      id: 'demo-1',
      title: '演示歌曲 1',
      artist: '演示艺术家 A',
      album: '演示专辑',
      duration: 180,
      coverUrl: DEFAULT_COVER
    },
    {
      id: 'demo-2', 
      title: '演示歌曲 2',
      artist: '演示艺术家 B',
      album: '演示专辑',
      duration: 240,
      coverUrl: DEFAULT_COVER
    },
    {
      id: 'demo-3',
      title: '演示歌曲 3',
      artist: '演示艺术家 C', 
      album: '演示专辑',
      duration: 200,
      coverUrl: DEFAULT_COVER
    }
  ];

  return (
    <div className="song-highlight-demo p-6 bg-gray-800 rounded-lg mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">🎵 歌曲高亮效果演示</h2>
      
      {/* 当前播放状态 */}
      <div className="current-status mb-6 p-4 bg-gray-700 rounded">
        <h3 className="text-lg font-semibold text-white mb-2">当前播放状态</h3>
        {currentSong ? (
          <div className="flex items-center space-x-4">
            <CachedImage
              src={currentSong.coverUrl || DEFAULT_COVER}
              className="w-12 h-12 rounded"
              alt={currentSong.title}
            />
            <div>
              <p className="text-white font-medium">{currentSong.title}</p>
              <p className="text-gray-300 text-sm">{currentSong.artist}</p>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && <span className="text-yellow-400">⏳ 加载中</span>}
              {isPlaying && <span className="text-green-400">▶️ 播放中</span>}
              {isPaused && <span className="text-orange-400">⏸️ 已暂停</span>}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">当前没有播放歌曲</p>
        )}
      </div>

      {/* 演示歌曲列表 */}
      <div className="demo-song-list">
        <h3 className="text-lg font-semibold text-white mb-3">演示歌曲列表</h3>
        <p className="text-gray-400 text-sm mb-4">
          以下列表展示了高亮效果。当前播放的歌曲会有特殊的视觉反馈：
        </p>
        
        <div className="space-y-2">
          {demoSongs.map((song, index) => {
            const highlightInfo = useCurrentSongHighlight(song, song.id);
            
            return (
              <div
                key={song.id}
                className={`demo-song-item p-3 rounded transition-all duration-300 ${highlightInfo.containerClassName} ${
                  highlightInfo.isCurrentSong 
                    ? 'bg-gray-700 border border-blue-500/30' 
                    : 'bg-gray-750 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* 序号/状态指示器 */}
                  <div className="w-8 text-center">
                    {highlightInfo.isCurrentSong ? (
                      highlightInfo.playingIndicator
                    ) : (
                      <span className="text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* 封面 */}
                  <CachedImage
                    src={song.coverUrl}
                    className="w-10 h-10 rounded"
                    alt={song.title}
                  />
                  
                  {/* 歌曲信息 */}
                  <div className="flex-1">
                    <h4 className={`font-medium ${highlightInfo.titleClassName || 'text-white'}`}>
                      {song.title}
                    </h4>
                    <p className={`text-sm ${highlightInfo.artistClassName || 'text-gray-400'}`}>
                      {song.artist}
                    </p>
                  </div>
                  
                  {/* 专辑 */}
                  <div className="hidden md:block text-gray-400 text-sm">
                    {song.album}
                  </div>
                  
                  {/* 时长 */}
                  <div className="text-gray-400 text-sm">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 播放队列预览 */}
      {queue.length > 0 && (
        <div className="queue-preview mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">当前播放队列</h3>
          <p className="text-gray-400 text-sm mb-4">
            队列中的歌曲也会显示高亮效果：
          </p>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {queue.slice(0, 5).map((song, index) => {
              const highlightInfo = useCurrentSongHighlight(song, song.id);
              
              return (
                <div
                  key={song.id}
                  className={`queue-song-item p-2 rounded text-sm ${highlightInfo.containerClassName} ${
                    highlightInfo.isCurrentSong 
                      ? 'bg-gray-700 border border-blue-500/30' 
                      : 'bg-gray-750'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 text-center">
                      {highlightInfo.isCurrentSong ? (
                        <span className="text-blue-400">♪</span>
                      ) : (
                        <span className="text-gray-500">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`${highlightInfo.titleClassName || 'text-white'}`}>
                        {song.title}
                      </span>
                      <span className={`ml-2 ${highlightInfo.artistClassName || 'text-gray-400'}`}>
                        - {song.artist}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {queue.length > 5 && (
              <div className="text-gray-500 text-xs text-center py-2">
                还有 {queue.length - 5} 首歌曲...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 高亮效果说明 */}
      <div className="highlight-info mt-6 p-4 bg-gray-900 rounded">
        <h3 className="text-lg font-semibold text-white mb-3">高亮效果说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-blue-400 font-medium mb-2">视觉效果</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• 柔和的背景渐变</li>
              <li>• 左侧边框高亮</li>
              <li>• 歌曲名和艺术家名颜色变化</li>
              <li>• 播放状态指示器</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-400 font-medium mb-2">状态指示</h4>
            <ul className="text-gray-300 space-y-1">
              <li>🔊 正在播放</li>
              <li>⏸️ 已暂停</li>
              <li>⏳ 加载中</li>
              <li>🎵 当前歌曲</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongHighlightDemo;
