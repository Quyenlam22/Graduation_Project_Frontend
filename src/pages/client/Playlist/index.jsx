import { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Flex, Button, Space, Divider, Spin } from 'antd';
import { PlayCircleFilled, HeartOutlined, MoreOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { SongContext } from '../../../Context/SongContext';
import { MusicContext } from '../../../Context/MusicContext'; 
import PlaylistSection from '../../../components/Playlist/PlaylistSection';
import './Playlist.scss';

const { Title, Text } = Typography;

function Playlist() {
  const { id } = useParams();
  const { playlists, loading: playlistLoading } = useContext(PlaylistContext);
  const { loading: songLoading } = useContext(SongContext);
  
  // 2. Lấy các hàm cần thiết từ MusicContext
  const { playSong, formatTime } = useContext(MusicContext);

  // Tìm thông tin playlist hiện tại
  const currentPlaylist = useMemo(() => {
    return playlists.find(item => item._id === id);
  }, [playlists, id]);

  // Lấy danh sách bài hát trong playlist
  const playlistSongs = useMemo(() => {
    if (currentPlaylist && currentPlaylist.songs && currentPlaylist.songs.length > 0) {
      return currentPlaylist.songs;
    }
    return [];
  }, [currentPlaylist]);

  // Tính tổng thời lượng playlist
  const totalDuration = useMemo(() => {
    const totalSeconds = playlistSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  }, [playlistSongs]);

  // 3. Hàm xử lý phát một bài hát cụ thể
  const handlePlaySong = (song) => {
    playSong({
      ...song,
      artist: song.artistName,
      avatar: song.cover,
    });
  };

  // 4. Hàm xử lý phát toàn bộ playlist (phát từ bài đầu tiên)
  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      handlePlaySong(playlistSongs[0]);
    }
  };

  if (playlistLoading || songLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="playlist-detail-container">
      {id && currentPlaylist && (
        <div className="playlist-hero">
          <div className="playlist-left">
            <img className="playlist-avatar" src={currentPlaylist.avatar} alt={currentPlaylist.title} />
            <Flex vertical className="playlist-info-text">
              <Text className="label-playlist">MY PLAYLIST</Text>
              <Title level={1} style={{ color: '#fff', margin: '5px 0' }}>{currentPlaylist.title}</Title>
              <Text style={{ color: '#9CA3A1', display: 'block', marginBottom: '15px' }}>
                {currentPlaylist.description || "No description available"}
              </Text>
              <Text style={{ color: '#fff' }}>
                <Text strong style={{ color: '#FE2851' }}>{currentPlaylist.userId || "Muzia Flow"}</Text> • {playlistSongs.length} songs, {totalDuration}
              </Text>
              
              <Space size="middle" style={{ marginTop: 25 }}>
                <Button 
                  type="primary" 
                  shape="round" 
                  icon={<PlayCircleFilled />} 
                  size="large" 
                  className="btn-play-all"
                  onClick={handlePlayAll} // 5. Sự kiện Play All
                >
                  Play All
                </Button>
                <Button ghost shape="circle" icon={<MoreOutlined />} size="large" className="btn-action" />
              </Space>
            </Flex>
          </div>
        </div>
      )}

      {id && currentPlaylist && (
        <div className="playlist-tracks">
          <div className="tracklist-header">
            <Row align="middle">
              <Col span={1}><Text type="secondary">#</Text></Col>
              <Col span={14}><Text type="secondary">Songs</Text></Col>
              <Col span={6}><Text type="secondary">Like</Text></Col>
              <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined style={{ color: '#9CA3A1' }} /></Col>
            </Row>
          </div>

          <div className="track-list">
            {playlistSongs.map((song, index) => (
              <div 
                className="track-item" 
                key={song._id}
                onClick={() => handlePlaySong(song)} // 6. Sự kiện phát nhạc khi nhấn vào hàng
                style={{ cursor: 'pointer' }}
              >
                <Row align="middle" style={{ width: '100%' }}>
                  <Col span={1}><Text className="track-index">{index + 1}</Text></Col>
                  <Col span={14}>
                    <Flex align="center" gap={15}>
                      <Avatar shape="square" size={40} src={song.cover} />
                      <div className="track-meta">
                        <Title level={5} className="song-name" style={{ color: '#fff', margin: 0, fontSize: '14px' }}>{song.title}</Title>
                        <Text className="artist-name" style={{ color: '#9CA3A1' }}>{song.artistName}</Text>
                      </div>
                    </Flex>
                  </Col>
                  <Col span={6}>
                    <HeartOutlined 
                      className="favorite-icon" 
                      onClick={(e) => e.stopPropagation()} // Ngăn phát nhạc khi nhấn Like
                    />
                  </Col>
                  <Col span={3} style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    <Text className="track-duration">{formatTime(song.duration || 0)}</Text>
                  </Col>
                </Row>
              </div>
            ))}

            {playlistSongs.length === 0 && (
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
                No songs available in this playlist.
              </Text>
            )}
          </div>
        </div>
      )}

      <section style={{ marginBottom: 50, marginTop: id ? 50 : 0 }}>
        <Flex justify="space-between" align="baseline" className="section-title-container">
          <Title level={4} className="section-title">
            {!id ? "All Playlists" : "Suggested Playlists"}
          </Title>
          <Link to={"/playlists"} className="see-all">View all</Link>
        </Flex>
        <PlaylistSection playlists={playlists} isSlider={!!id} />
      </section>
    </div>
  );
}

export default Playlist;