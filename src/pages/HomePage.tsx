import '../components/components.scss';

const HomePage = () => {
  // 推荐歌单数据
  const recommendedPlaylists = [
    {
      id: 1,
      title: '电音混对精选',
      coverUrl: 'https://p3.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951164169494808.jpg',
      playCount: 128.5
    },
    {
      id: 2,
      title: '午后慵懒时光',
      coverUrl: 'https://p1.music.126.net/yhB4DCPsxG6YKvz8e_kpVQ==/109951167292155487.jpg',
      playCount: 89.3
    },
    {
      id: 3,
      title: '爵士乐精选集',
      coverUrl: 'https://p1.music.126.net/rV8WytTXoVKPNd_Snscg-w==/109951167434793854.jpg',
      playCount: 56.8
    },
    {
      id: 4,
      title: '复古情调',
      coverUrl: 'https://p1.music.126.net/WQ0n56RyGZe8-YPXKuZ9MA==/109951167238642565.jpg',
      playCount: 75.2
    },
    {
      id: 5,
      title: '轻音乐精选',
      coverUrl: 'https://p1.music.126.net/jh1V_ZPDXJVtMcKWXxLOyw==/18829136905110355.jpg',
      playCount: 92.1
    }
  ];

  // 最近播放歌曲数据
  const recentlyPlayedSongs = [
    {
      id: 1,
      title: '星空漫游',
      artist: '陈思琪',
      album: '夜空之下',
      duration: 262, // 4:32
      coverUrl: 'https://p2.music.126.net/uTwOm8AEFFX_BYHvfvFcmQ==/109951164232057952.jpg' 
    },
    {
      id: 2,
      title: '城市霓虹',
      artist: '李明轩',
      album: '都市物语',
      duration: 225, // 3:45
      coverUrl: 'https://p2.music.126.net/KZmhDl9qu3FcWSbw3L2LxQ==/19085831835061233.jpg'
    },
    {
      id: 3,
      title: '雨后彩虹',
      artist: '张雨晴',
      album: '春日记忆',
      duration: 318, // 5:18
      coverUrl: 'https://p1.music.126.net/Y9-M1mJ3rNKsuj9NB-dS4w==/109951168129091608.jpg'
    },
    {
      id: 4,
      title: '海边微风',
      artist: '王海涛',
      album: '夏日情书',
      duration: 255, // 4:15
      coverUrl: 'https://p1.music.126.net/tpqIHtt0jYeMaTdV-LwDdA==/109951165052089096.jpg'
    },
    {
      id: 5,
      title: '山间晨曦',
      artist: '林清风',
      album: '自然之声',
      duration: 239, // 3:59
      coverUrl: 'https://p2.music.126.net/Wcs2dbukFx3TUWkRuxVCpw==/3431575794705764.jpg'
    }
  ];

  // 格式化播放量
  const formatPlayCount = (count: number) => {
    return count > 10 ? `${count.toFixed(1)}万` : `${count * 10000}`;
  };

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <section className="section">
        <h2 className="section-title">推荐歌单</h2>
        <div className="playlist-grid">
          {recommendedPlaylists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <div className="playlist-card__cover">
                <img src={playlist.coverUrl} alt={playlist.title} />
              </div>
              <div className="playlist-card__title">{playlist.title}</div>
              <div className="playlist-card__info">播放量：{formatPlayCount(playlist.playCount)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">最近播放</h2>
        <table className="songs-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>歌曲标题</th>
              <th>歌手</th>
              <th>专辑</th>
              <th style={{ width: '80px' }}>时长</th>
            </tr>
          </thead>
          <tbody>
            {recentlyPlayedSongs.map((song, index) => (
              <tr key={song.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="song-item">
                    <div className="song-item__cover">
                      <img src={song.coverUrl} alt={song.title} />
                    </div>
                    <div className="song-item__info">
                      <div className="song-item__title">{song.title}</div>
                    </div>
                  </div>
                </td>
                <td>{song.artist}</td>
                <td>{song.album}</td>
                <td>{formatDuration(song.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default HomePage; 