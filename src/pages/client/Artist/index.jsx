import { Typography, Row, Col, Avatar, Flex, Button, Space, Divider, Card } from 'antd';
import { PlayCircleFilled, HeartOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Artist.scss';
import AlbumSection from '../../../components/Album/AlbumSection';
import "../../client/Home/Home.scss"
import ArtistSection from '../../../components/Artist/ArtistSection';

const { Title, Text } = Typography;

function Artist() {
  const currentArtist = {
    name: "Luna Eclipse",
    followers: "2.4M",
    monthly_listeners: "15M",
    avatar: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1500&q=80",
    is_verified: true,
  };

  return (
    <div className="artist-detail-container">
      {/* SECTION 1: ARTIST HERO BANNER */}
      <div className="artist-hero" style={{ backgroundImage: `url(${currentArtist.avatar})` }}>
        <div className="hero-overlay">
          <Flex vertical>
            {currentArtist.is_verified && (
              <Flex align="center" gap={5} className="verified-badge">
                <CheckCircleFilled style={{ color: '#3d91ff' }} />
                <Text style={{ color: '#fff', fontSize: '12px' }}>Verified Artist</Text>
              </Flex>
            )}
            <Title className="artist-name-big">{currentArtist.name}</Title>
            <Text className="artist-stats">
              {currentArtist.monthly_listeners} monthly listeners
            </Text>
            
            <Space size="middle" style={{ marginTop: 25 }}>
              <Button type="primary" shape="round" icon={<PlayCircleFilled />} size="large" className="btn-play-artist">
                Random Play
              </Button>
              <Button ghost shape="circle" icon={<HeartOutlined />} size="large" className="btn-action" />
            </Space>
          </Flex>
        </div>
      </div>

      {/* SECTION 2: TOP TRACKS & POPULAR RELEASES */}
      <Row gutter={40} className="artist-content">
        <Col span={16}>
          <Title level={4} className="section-title">Popular</Title>
          <div className="track-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div className="track-item" key={i}>
                <Row align="middle" style={{ width: '100%' }}>
                  <Col span={1}><Text className="track-index">{i}</Text></Col>
                  <Col span={18}>
                    <Flex align="center" gap={15}>
                      <Avatar shape="square" size={40} src={`https://picsum.photos/100/100?random=${i+200}`} />
                      <Text strong className="song-name">Hit Song {i}</Text>
                    </Flex>
                  </Col>
                  <Col span={2}><HeartOutlined className="favorite-icon" /></Col>
                  <Col span={3} style={{ textAlign: 'right' }}><Text className="track-duration">3:45</Text></Col>
                </Row>
              </div>
            ))}
          </div>
        </Col>

        {/* SIDEBAR: ABOUT ARTIST */}
        <Col span={8}>
          <Title level={4} className="section-title">Introduction</Title>
          <div className="about-card">
             <Text type="secondary" style={{ color: '#9CA3A1' }}>
                Luna Eclipse là một nghệ sĩ đa tài nổi tiếng với phong cách Pop hiện đại kết hợp với âm hưởng điện tử...
             </Text>
             <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
             <Title level={5} style={{ color: '#fff' }}>Infomation</Title>
             <Text style={{ color: '#9CA3A1', display: 'block' }}>Hạng: Toàn cầu #124</Text>
             <Text style={{ color: '#9CA3A1', display: 'block' }}>Theo dõi: {currentArtist.followers}</Text>
          </div>
        </Col>
      </Row>

      <Divider className="custom-divider" />

      {/* SECTION 3: OTHER ALBUMS (Thiết kế giống Home) */}
      <section style={{ marginBottom: 50 }}>
        <Flex justify="space-between" align="baseline" className="section-title-container">
            <Title level={4} className="section-title">Fans also like</Title>
            <Link to="/albums" className="see-all">View all</Link>
        </Flex>
        <AlbumSection/>
      </section>

      <Divider className="custom-divider" />

      <section style={{ marginBottom: 50 }}>
        <Flex justify="space-between" align="baseline" className="section-title-container">
            <Title level={4} className="section-title">Another Artists</Title>
        </Flex>
        <ArtistSection />
      </section>
    </div>
  );
}

export default Artist;