import { useEffect, useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Song } from '../services/MusicLibraryService';
import '../components/components.scss';

const LibraryPage = () => {
  const [search, setSearch] = useState('');
  
  // 从store获取状态和方法
  const { songs, isLoading, scanLibrary, playSong } = useMusicStore();

  // 组件加载时扫描音乐库
  useEffect(() => {
    if (songs.length === 0) {
      scanLibrary('/Users/Music');
    }
  }, [scanLibrary, songs.length]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    scanLibrary('/Users/Music');
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase()) ||
      song.album.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">我的音乐库</h1>
        <div className="space-x-2">
          <button className="btn btn-outline">导入音乐</button>
          <button 
            className={`btn btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载中...
              </>
            ) : '刷新库'}
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="搜索歌曲、艺术家或专辑..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex-center py-10">
          <svg className="w-12 h-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="py-8 text-center text-gray">没有找到匹配的歌曲</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="songs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>标题</th>
                <th>艺术家</th>
                <th>专辑</th>
                <th className="text-right">时长</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map((song, index) => (
                <tr
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                >
                  <td>{index + 1}</td>
                  <td>{song.title}</td>
                  <td>{song.artist}</td>
                  <td>{song.album}</td>
                  <td className="text-right">{formatDuration(song.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LibraryPage; 