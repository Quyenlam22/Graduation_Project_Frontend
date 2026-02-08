import { Typography, Tabs, Row, Col, Avatar, Flex, Button, Space, Divider } from 'antd';
import { PlayCircleFilled, HeartOutlined, MoreOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import './MyFavorite.scss';
import { useNavigate } from 'react-router';
import useTitle from '../../../hooks/useTitle';
import '../Playlist/Playlist.scss';

const { Title, Text } = Typography;

function MyFavorite() {
  const navigate = useNavigate();

  useTitle("My Library")

  const onChange = (key) => {
    console.log(key);
  };

  // Nội dung khi chưa có dữ liệu (Empty State)
  const EmptyState = ({ message }) => (
    <div className="favorite__empty">
      <div className="favorite__empty-icon">
        <img src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/empty-fav-song-dark.png" alt="Empty" />
      </div>
      <p className="favorite__empty-text">{message}</p>
      <Button className="favorite__empty-btn" type="primary" shape="round" onClick={() => navigate("/")}>
        DISCOVER NOW
      </Button>
    </div>
  );

  const currentPlaylist = {
    title: "Chill Mix #1",
    description: "Những giai điệu nhẹ nhàng cho buổi chiều tối",
    avatar: "https://picsum.photos/500/500?grayscale&random=20",
    creator: "Muzia Flow",
    total_songs: 25,
    duration: "1 giờ 30 phút"
  };

  const items = [
    {
      key: '1',
      label: 'SONG',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
        </div>
      ),
    },
    {
      key: '2',
      label: 'ALBUM',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
        </div>
      ),
    },
    {
      key: '3',
      label: 'PLAYLIST',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
           <br />
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
                      <Col span={6}><Text type="secondary">Time Add</Text></Col>
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
                            <Text style={{ color: '#9CA3A1' }}>8 thg 2, 2026</Text>
                          </Col>
                          <Col span={3} style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                            <HeartOutlined className="favorite-icon" />
                            <DeleteOutlined className="delete-icon" />
                            <Text className="track-duration">3:45</Text>
                          </Col>
                        </Row>
                      </div>
                    ))}
                </div>
              </div>
            </div>
        </div>
      ),
    },
  ];

  return (
    <div className="favorite">
      <div className="favorite__header">
        <h2 className="favorite__title">My Library <PlayCircleFilled className="favorite__play-icon" /></h2>
      </div>

      <Tabs 
        defaultActiveKey="1" 
        items={items} 
        onChange={onChange} 
        className="favorite__tabs"
      />
    </div>
  );
}

export default MyFavorite;