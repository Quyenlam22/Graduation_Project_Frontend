import { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Flex, Button, Space, Spin, message } from 'antd';
import { 
  PlayCircleFilled, HeartOutlined, HeartFilled, 
  MoreOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { SongContext } from '../../../Context/SongContext';
import { MusicContext } from '../../../Context/MusicContext'; 
import { AuthContext } from '../../../Context/AuthProvider'; // Thêm AuthContext
import PlaylistSection from '../../../components/Playlist/PlaylistSection';
import './Playlist.scss';
import { toggleFavorite } from '../../../services/authService'; // Thêm service

const { Title, Text } = Typography;

function Playlist() {
  const { id } = useParams();
  const { user, setUser } = useContext(AuthContext); // Lấy thông tin user
  const { playlists, loading: playlistLoading } = useContext(PlaylistContext);
  const { loading: songLoading } = useContext(SongContext);
  const { playSong, formatTime } = useContext(MusicContext);

  const currentPlaylist = useMemo(() => {
    return playlists.find(item => item._id === id);
  }, [playlists, id]);

  const playlistSongs = useMemo(() => {
    if (currentPlaylist && currentPlaylist.songs && currentPlaylist.songs.length > 0) {
      return currentPlaylist.songs;
    }
    return [];
  }, [currentPlaylist]);

  const totalDuration = useMemo(() => {
    const totalSeconds = playlistSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  }, [playlistSongs]);

  // Logic xử lý yêu thích (Y hệt bên Album)
  const handleToggleFavorite = async (type, itemId, e) => {
    if (e) e.stopPropagation(); 
    if (!user) {
        message.error("Please log in to use this function!");
        return;
    }

    try {
      const response = await toggleFavorite({
        uid: user.uid,
        type: type, // 'playlists' hoặc 'songs'
        itemId: itemId
      });
      
      if (response.success) {
        setUser({
          ...user,
          favorites: {
            ...user.favorites,
            [type]: response.updatedFavorites
          }
        });
        message.success(response.updatedFavorites.includes(itemId) ? "Added to favorites" : "Removed from favorites");
      }
    } catch (error) {
      message.error("An error occurred, please try again later.");
    }
  };

  const handlePlaySong = (song) => {
    playSong({ ...song, artist: song.artistName, avatar: song.cover }, playlistSongs);
  };

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) playSong(playlistSongs[0], playlistSongs);
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
                  type="primary" shape="round" icon={<PlayCircleFilled />} 
                  size="large" className="btn-play-all" onClick={handlePlayAll}
                >
                  Play All
                </Button>

                {/* NÚT LIKE PLAYLIST: Ở cạnh Play All */}
                <Button 
                  ghost shape="circle" 
                  icon={user?.favorites?.playlists?.includes(id) ? <HeartFilled /> : <HeartOutlined />} 
                  size="large" 
                  style={{
                    color: user?.favorites?.playlists?.includes(id) ? '#FE2851' : '#fff',
                    borderColor: user?.favorites?.playlists?.includes(id) ? '#FE2851' : '#fff'
                  }}
                  onClick={(e) => handleToggleFavorite('playlists', id, e)}
                />

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
              <Col span={1}><Text type="secondary" style={{ color: '#9CA3A1' }}>#</Text></Col>
              <Col span={14}><Text type="secondary" style={{ color: '#9CA3A1' }}>Songs</Text></Col>
              <Col span={6}><Text type="secondary" style={{ color: '#9CA3A1' }}>Like</Text></Col>
              <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined style={{ color: '#9CA3A1' }} /></Col>
            </Row>
          </div>

          <div className="track-list">
            {playlistSongs.map((song, index) => (
              <div 
                className="track-item" 
                key={song._id}
                onClick={() => handlePlaySong(song)}
                style={{ cursor: 'pointer' }}
              >
                <Row align="middle" style={{ width: '100%' }}>
                  <Col span={1}><Text className="track-index" style={{ color: '#9CA3A1' }}>{index + 1}</Text></Col>
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
                    {/* NÚT LIKE BÀI HÁT TRONG PLAYLIST */}
                    <div onClick={(e) => handleToggleFavorite('songs', song._id, e)}>
                        {user?.favorites?.songs?.includes(song._id) ? (
                            <HeartFilled style={{ color: '#FE2851', fontSize: '18px', cursor: 'pointer' }} />
                        ) : (
                            <HeartOutlined style={{ fontSize: '18px', cursor: 'pointer', color: '#9CA3A1' }} />
                        )}
                    </div>
                  </Col>
                  <Col span={3} style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                    <Text className="track-duration" style={{ color: '#9CA3A1' }}>{formatTime(song.duration || 0)}</Text>
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
          <Title level={4} className="section-title" style={{ color: '#fff' }}>
            {!id ? "All Playlists" : "Suggested Playlists"}
          </Title>
          <Link to={"/playlists"} className="see-all" style={{ color: '#FE2851' }}>View all</Link>
        </Flex>
        <PlaylistSection playlists={playlists} isSlider={!!id} />
      </section>
    </div>
  );
}

export default Playlist;