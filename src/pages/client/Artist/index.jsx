import { Typography, Row, Col, Avatar, Flex, Button, Space, Divider, Spin, message } from 'antd';
import { PlayCircleFilled, HeartOutlined, HeartFilled, CheckCircleFilled } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { ArtistContext } from '../../../Context/ArtistContext';
import { AlbumContext } from '../../../Context/AlbumContext';
import { SongContext } from '../../../Context/SongContext';
import { MusicContext } from '../../../Context/MusicContext'; 
import { AuthContext } from '../../../Context/AuthProvider'; // Thêm AuthContext
import AlbumSection from '../../../components/Album/AlbumSection';
import ArtistSection from '../../../components/Artist/ArtistSection';
import './Artist.scss';
import { toggleFavorite } from '../../../services/authService'; // Thêm service

const { Title, Text } = Typography;

function Artist() {
  const { id } = useParams();
  const { user, setUser } = useContext(AuthContext); // Lấy thông tin user
  const { artists, loading: artistLoading } = useContext(ArtistContext);
  const { albums } = useContext(AlbumContext);
  const { songs } = useContext(SongContext);
  
  const { playSong, formatTime } = useContext(MusicContext);

  const currentArtist = useMemo(() => artists.find(a => a._id === id), [artists, id]);

  const popularSongs = useMemo(() => 
    songs.filter(s => s.artistId === id).slice(0, 5), 
  [songs, id]);

  const artistAlbums = useMemo(() => 
    albums.filter(al => al.artistId === id), 
  [albums, id]);

  // Logic xử lý yêu thích (Y hệt bên Album và Playlist)
  const handleToggleFavorite = async (type, itemId, e) => {
    if (e) e.stopPropagation(); 
    if (!user) {
        message.error("Please log in to use this function!");
        return;
    }

    try {
      const response = await toggleFavorite({
        uid: user.uid,
        type: type, // 'artists' hoặc 'songs'
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

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const handlePlaySong = (song) => {
    playSong(
      {
        ...song,
        artist: song.artistName,
        avatar: song.cover,
      },
      popularSongs 
    );
  };

  const handleRandomPlay = () => {
    if (popularSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * popularSongs.length);
      const selectedSong = popularSongs[randomIndex];
      
      playSong(
        {
          ...selectedSong,
          artist: selectedSong.artistName,
          avatar: selectedSong.cover,
        },
        popularSongs 
      );
    }
  };

  if (artistLoading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div className="artist-detail-container">
      {id && currentArtist ? (
        <>
          <div className="artist-hero" style={{ backgroundImage: `url(${currentArtist.avatar})` }}>
            <div className="hero-overlay">
              <Flex vertical>
                <Flex align="center" gap={5} className="verified-badge">
                  <CheckCircleFilled style={{ color: '#3d91ff' }} />
                  <Text style={{ color: '#fff', fontSize: '12px' }}>Verified Artist</Text>
                </Flex>
                <Title className="artist-name-big">{currentArtist.name}</Title>
                <Text className="artist-stats">
                  {formatNumber(currentArtist.nb_fan || 0)} listeners
                </Text>
                <Space size="middle" style={{ marginTop: 25 }}>
                  <Button 
                    type="primary" 
                    shape="round" 
                    icon={<PlayCircleFilled />} 
                    size="large" 
                    className="btn-play-artist"
                    onClick={handleRandomPlay} 
                  >
                    Random Play
                  </Button>

                  {/* NÚT LIKE ARTIST: Đổi màu và viền khi đã like */}
                  <Button 
                    ghost 
                    shape="circle" 
                    icon={user?.favorites?.artists?.includes(id) ? <HeartFilled /> : <HeartOutlined />} 
                    size="large" 
                    style={{
                      color: user?.favorites?.artists?.includes(id) ? '#FE2851' : '#fff',
                      borderColor: user?.favorites?.artists?.includes(id) ? '#FE2851' : '#fff'
                    }}
                    onClick={(e) => handleToggleFavorite('artists', id, e)}
                  />
                </Space>
              </Flex>
            </div>
          </div>

          <Row gutter={40} className="artist-content" style={{ padding: '24px' }}>
            <Col span={16}>
              <Title level={4} className="section-title">Popular</Title>
              <div className="track-list">
                {popularSongs.map((song, i) => (
                  <div 
                    className="track-item" 
                    key={song._id}
                    onClick={() => handlePlaySong(song)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <Row align="middle" style={{ width: '100%' }}>
                      <Col span={1}><Text className="track-index">{i + 1}</Text></Col>
                      <Col span={18}>
                        <Flex align="center" gap={15}>
                          <Avatar shape="square" size={40} src={song.cover} />
                          <Text strong style={{ color: '#fff' }}>{song.title}</Text>
                        </Flex>
                      </Col>
                      <Col span={2}>
                        {/* NÚT LIKE BÀI HÁT PHỔ BIẾN CỦA NGHỆ SĨ */}
                        <div onClick={(e) => handleToggleFavorite('songs', song._id, e)}>
                            {user?.favorites?.songs?.includes(song._id) ? (
                                <HeartFilled style={{ color: '#FE2851', fontSize: '18px', cursor: 'pointer' }} />
                            ) : (
                                <HeartOutlined style={{ fontSize: '18px', cursor: 'pointer', color: '#9CA3A1' }} />
                            )}
                        </div>
                      </Col>
                      <Col span={3} style={{ textAlign: 'right' }}>
                        <Text style={{ color: '#9CA3A1' }}>
                          {formatTime(song.duration || 0)} 
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Col>

            <Col span={8}>
              <Title level={4} className="section-title">Introduction</Title>
              <div className="about-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                <Text style={{ color: '#9CA3A1', display: 'block', marginBottom: '15px' }}>
                  {currentArtist.description || `Thông tin về ${currentArtist.name} đang được cập nhật...`}
                </Text>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <Title level={5} style={{ color: '#fff' }}>Information</Title>
                <Text style={{ color: '#9CA3A1', display: 'block' }}>Likes: {formatNumber(currentArtist.like?.length || 0)}</Text>
                <Text style={{ color: '#9CA3A1', display: 'block' }}>Fans: {formatNumber(currentArtist.nb_fan || 0)}</Text>
              </div>
            </Col>
          </Row>

          <Divider className="custom-divider" />
          <section style={{ marginBottom: 50, padding: '0 24px' }}>
            <AlbumSection albums={artistAlbums} title="Discography" isSlider={true} />
          </section>
        </>
      ) : (
        <section style={{ padding: '40px 24px' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '30px' }}>All Artists</Title>
          <ArtistSection artists={artists} isSlider={false} />
        </section>
      )}

      {id && (
        <>
          <Divider className="custom-divider" />
          <section style={{ marginBottom: 50, padding: '0 24px' }}>
            <Flex justify="space-between" align="baseline" className="section-title-container">
              <Title level={4} className="section-title">Another Artists</Title>
              <Link to="/artists" className="see-all">View all</Link>
            </Flex>
            <ArtistSection artists={artists} isSlider={true} />
          </section>
        </>
      )}
    </div>
  );
}

export default Artist;