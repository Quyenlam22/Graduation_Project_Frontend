import { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Flex, Button, Space, Divider, Spin } from 'antd';
import { PlayCircleFilled, HeartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AlbumContext } from '../../../Context/AlbumContext';
import { SongContext } from '../../../Context/SongContext';
import { formatDate } from '../../../utils/formatTime';
import AlbumSection from '../../../components/Album/AlbumSection';
import './Album.scss';

const { Title, Text } = Typography;

function Album() {
  const { id } = useParams(); // Lấy ID từ URL (nếu có)
  const { albums, loading: albumLoading } = useContext(AlbumContext);
  const { songs, loading: songLoading } = useContext(SongContext);

  // 1. Tìm thông tin album hiện tại dựa trên ID từ URL
  const currentAlbum = useMemo(() => {
    return albums.find(item => item._id === id);
  }, [albums, id]);

  // 2. Lọc danh sách bài hát thuộc album này
  const albumSongs = useMemo(() => {
    return songs.filter(song => song.albumId === id);
  }, [songs, id]);

  // Hàm format thời gian (giây -> phút:giây)
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (albumLoading || songLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
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
              <Text type="secondary" style={{ color: '#9CA3A1' }}>
                {/* {formatDate(currentAlbum.createdAt, 'YYYY')} • {currentAlbum.nb_tracks || albumSongs.length} songs */}
                {formatDate(currentAlbum.createdAt, 'YYYY')} • {albumSongs.length} songs
              </Text>
              
              <Space size="middle" style={{ marginTop: 12 }}>
                <Button type="primary" shape="round" icon={<PlayCircleFilled />} size="large" className="btn-play-all">
                  Play All
                </Button>
                <Button ghost shape="circle" icon={<HeartOutlined />} size="large" className="btn-action" />
              </Space>
            </Flex>
          </div>

          <div className="album-right">
            <div className="tracklist-header">
              <Row align="middle">
                <Col span={1}><Text type="secondary" style={{ color: '#9CA3A1' }}>#</Text></Col>
                <Col span={16}><Text type="secondary" style={{ color: '#9CA3A1' }}>Songs</Text></Col>
                <Col span={4}><Text type="secondary" style={{ color: '#9CA3A1' }}>Like</Text></Col>
                <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined style={{ color: '#9CA3A1' }} /></Col>
              </Row>
            </div>
            
            <div className="track-list">
              {albumSongs.map((song, index) => (
                <div className="track-item" key={song._id}>
                  <Row align="middle" style={{ width: '100%' }}>
                    <Col span={1}>
                      <Text className="track-index">{index + 1}</Text>
                    </Col>
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
                      <HeartOutlined style={{paddingLeft: "6px"}} className="favorite-icon" />
                    </Col>
                    <Col span={3} style={{ textAlign: 'right' }}>
                      <Text className="track-duration">{formatDuration(song.duration)}</Text>
                    </Col>
                  </Row>
                </div>
              ))}
              
              {albumSongs.length === 0 && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
                  No songs available in this album.
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      <section style={{ marginBottom: 50 }}>
        <AlbumSection albums={albums} title={!id ? "All Albums" : "Other Albums"} />
      </section>
    </div>
  );
}

export default Album;