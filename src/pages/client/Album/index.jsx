import { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Flex, Button, Space, Spin, message } from 'antd';
import { PlayCircleFilled, HeartOutlined, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import { AlbumContext } from '../../../Context/AlbumContext';
import { SongContext } from '../../../Context/SongContext';
import { MusicContext } from '../../../Context/MusicContext'; 
import { AuthContext } from '../../../Context/AuthProvider'; 
import { formatDate } from '../../../utils/formatTime';
import AlbumSection from '../../../components/Album/AlbumSection';
import './Album.scss';
import { toggleFavorite } from '../../../services/authService';

const { Title, Text } = Typography;

function Album() {
  const { id } = useParams();
  const { user, setUser } = useContext(AuthContext); 
  const { albums, loading: albumLoading } = useContext(AlbumContext);
  const { songs, loading: songLoading } = useContext(SongContext);
  const { playSong, formatTime } = useContext(MusicContext);

  const currentAlbum = useMemo(() => albums.find(item => item._id === id), [albums, id]);
  const albumSongs = useMemo(() => songs.filter(song => song.albumId === id), [songs, id]);

  const handleToggleFavorite = async (type, itemId, e) => {
    if (e) e.stopPropagation(); 
    
    if (!user) {
        message.error("Please log in to use this function!");
        return;
    }

    try {
      const response = await toggleFavorite({
        uid: user.uid,
        type: type, 
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
    playSong({ ...song, artist: song.artistName, avatar: song.cover }, albumSongs);
  };

  const handlePlayAll = () => {
    if (albumSongs.length > 0) playSong(albumSongs[0], albumSongs);
  };

  if (albumLoading || songLoading) {
    return <div className="text-center p-12"><Spin size="large" /></div>;
  }

  return (
    <div className="album-detail-container">
      {id && currentAlbum && (
        <div className="album-hero">
          <div className="album-left">
            <img className="album-cover" src={currentAlbum.avatar} alt={currentAlbum.title} />
            <Flex vertical>
              <Title level={2} style={{ color: '#fff', margin: '15px 0 5px 0' }}>{currentAlbum.title}</Title>
              <Text style={{ color: '#FE2851', fontSize: '18px', display: 'block' }}>{currentAlbum.artistName}</Text>
              <Text type="secondary" style={{ color: '#9CA3A1', marginBottom: "8px" }}>
                {formatDate(currentAlbum.createdAt, 'YYYY')} • {albumSongs.length} songs
              </Text>
              
              <Space size="middle" className="mt-4">
                <Button type="primary" shape="round" icon={<PlayCircleFilled />} size="large" className="btn-play-all" onClick={handlePlayAll}>
                  Play All
                </Button>
                
                {/* NÚT LIKE ALBUM: Tự động đổi màu hồng và viền hồng khi đã like */}
                <Button 
                  ghost 
                  shape="circle" 
                  icon={user?.favorites?.albums?.includes(id) ? <HeartFilled /> : <HeartOutlined />} 
                  size="large" 
                  style={{
                    color: user?.favorites?.albums?.includes(id) ? '#FE2851' : '#fff',
                    borderColor: user?.favorites?.albums?.includes(id) ? '#FE2851' : '#fff'
                  }}
                  onClick={(e) => handleToggleFavorite('albums', id, e)}
                />
              </Space>
            </Flex>
          </div>

          <div className="album-right">
            <div className="tracklist-header">
              <Row align="middle">
                <Col span={1}><Text type="secondary" style={{ color: '#9CA3A1' }}>#</Text></Col>
                <Col span={16}><Text type="secondary" style={{ color: '#9CA3A1' }}>Songs</Text></Col>
                <Col span={4}><Text type="secondary" style={{ color: '#9CA3A1' }}>Like</Text></Col>
                <Col span={3}><ClockCircleOutlined style={{ color: '#9CA3A1' }} /></Col>
              </Row>
            </div>
            
            <div className="track-list">
              {albumSongs.map((song, index) => (
                <div className="track-item" key={song._id} onClick={() => handlePlaySong(song)}>
                  <Row align="middle" className="w-full">
                    <Col span={1}><Text className="track-index">{index + 1}</Text></Col>
                    <Col span={16}>
                      <Flex align="center" gap={15}>
                        <Avatar shape="square" size={40} src={song.cover} />
                        <div className="track-meta">
                          <Text strong className="song-name">{song.title}</Text>
                          <Text className="artist-name">{song.artistName}</Text>
                        </div>
                      </Flex>
                    </Col>
                    <Col span={4}>
                      {/* NÚT LIKE SONG: Chuyển màu hồng khi bài hát đã trong favorites */}
                      <div onClick={(e) => handleToggleFavorite('songs', song._id, e)}>
                        {user?.favorites?.songs?.includes(song._id) ? (
                            <HeartFilled style={{ color: '#FE2851', fontSize: '18px', cursor: 'pointer' }} />
                        ) : (
                            <HeartOutlined style={{ fontSize: '18px', cursor: 'pointer', color: '#9CA3A1' }} />
                        )}
                      </div>
                    </Col>
                    <Col span={3} className="text-right">
                      <Text className="track-duration">{formatTime(song.duration || 0)}</Text>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="mb-12">
        <AlbumSection albums={albums} title={!id ? "All Albums" : "Other Albums"} />
      </section>
    </div>
  );
}

export default Album;