import { create } from 'zustand';
import { MusicLibraryService, Song, Playlist } from '../services/MusicLibraryService';

interface MusicState {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  currentPlaylist: string | null;
  isLoading: boolean;
  
  // 操作
  setSongs: (songs: Song[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentPlaylist: (playlistId: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // 业务逻辑
  scanLibrary: (path: string) => Promise<void>;
  playSong: (song: Song) => Promise<void>;
  pauseSong: () => void;
  createPlaylist: (name: string) => Promise<void>;
  addSongToPlaylist: (songId: string, playlistId: string) => void;
  removeSongFromPlaylist: (songId: string, playlistId: string) => void;
}

const musicLibraryService = new MusicLibraryService();

export const useMusicStore = create<MusicState>((set, get) => ({
  songs: [],
  playlists: [],
  currentSong: null,
  isPlaying: false,
  currentPlaylist: null,
  isLoading: false,
  
  // 操作
  setSongs: (songs) => set({ songs }),
  setPlaylists: (playlists) => set({ playlists }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentPlaylist: (playlistId) => set({ currentPlaylist: playlistId }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // 业务逻辑
  scanLibrary: async (path) => {
    const { setIsLoading, setSongs } = get();
    setIsLoading(true);
    try {
      const songs = await musicLibraryService.scanLibrary(path);
      setSongs(songs);
    } catch (error) {
      console.error('扫描音乐库失败:', error);
    } finally {
      setIsLoading(false);
    }
  },
  
  playSong: async (song) => {
    const { setCurrentSong, setIsPlaying } = get();
    try {
      const success = await musicLibraryService.playSong(song);
      if (success) {
        setCurrentSong(song);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放音乐失败:', error);
    }
  },
  
  pauseSong: () => {
    set({ isPlaying: false });
    // 这里将来需要调用Tauri的API来暂停音乐
  },
  
  createPlaylist: async (name) => {
    const { playlists, setPlaylists } = get();
    try {
      const newPlaylist = await musicLibraryService.createPlaylist(name);
      if (newPlaylist) {
        setPlaylists([...playlists, newPlaylist]);
      }
    } catch (error) {
      console.error('创建播放列表失败:', error);
    }
  },
  
  addSongToPlaylist: (songId, playlistId) => {
    const { playlists, setPlaylists } = get();
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId && !playlist.songs.includes(songId)) {
        return {
          ...playlist,
          songs: [...playlist.songs, songId]
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
  },
  
  removeSongFromPlaylist: (songId, playlistId) => {
    const { playlists, setPlaylists } = get();
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(id => id !== songId)
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
  }
})); 