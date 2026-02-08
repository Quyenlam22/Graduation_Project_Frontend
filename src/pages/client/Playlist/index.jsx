import { Typography, Row, Col, Avatar, Flex, Button, Space, Divider } from 'antd';
import { PlayCircleFilled, HeartOutlined, MoreOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import './Playlist.scss';

const { Title, Text } = Typography;

function Playlist() {
  const currentPlaylist = {
    title: "Chill Mix #1",
    description: "Những giai điệu nhẹ nhàng cho buổi chiều tối",
    avatar: "https://picsum.photos/500/500?grayscale&random=20",
    creator: "Muzia Flow",
    total_songs: 25,
    duration: "1 giờ 30 phút"
  };

  return (
    <div className="playlist-detail-container">
      {/* SECTION 1: PLAYLIST HERO */}
      <div className="playlist-hero">
        <div className="playlist-left">
          <img className="playlist-avatar" src={currentPlaylist.avatar} alt="Playlist Cover" />
          <Flex vertical className="playlist-info-text">
            <Text className="label-playlist">MY PLAYLIST</Text>
            <Title level={1} style={{ color: '#fff', margin: '5px 0' }}>{currentPlaylist.title}</Title>
            <Text style={{ color: '#9CA3A1', display: 'block', marginBottom: '15px' }}>{currentPlaylist.description}</Text>
            <Text style={{ color: '#fff' }}>
                <Text strong style={{ color: '#FE2851' }}>{currentPlaylist.creator}</Text> • {currentPlaylist.total_songs} songs, {currentPlaylist.duration}
            </Text>
            
            <Space size="middle" style={{ marginTop: 25 }}>
              <Button type="primary" shape="round" icon={<PlayCircleFilled />} size="large" className="btn-play-all">
                Play All
              </Button>
              <Button ghost shape="circle" icon={<MoreOutlined />} size="large" className="btn-action" />
            </Space>
          </Flex>
        </div>
      </div>

      <Divider className="custom-divider" />

      {/* SECTION 2: TRACKLIST */}
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="track-item" key={i}>
                <Row align="middle" style={{ width: '100%' }}>
                  <Col span={1}>
                    <Text className="track-index">{i}</Text>
                  </Col>
                  <Col span={14}>
                    <Flex align="center" gap={15}>
                      <Avatar shape="square" size={40} src={`https://picsum.photos/100/100?random=${i+100}`} />
                      <div className="track-meta">
                        <Text strong className="song-name">Giai Điệu Chill {i}</Text>
                        <Text className="artist-name">Artist Name</Text>
                      </div>
                    </Flex>
                  </Col>
                  <Col span={6}>
                    <HeartOutlined className="favorite-icon" />
                  </Col>
                  <Col span={3} style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    {/* <DeleteOutlined className="delete-icon" /> */}
                    <Text className="track-duration">3:45</Text>
                  </Col>
                </Row>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Playlist;