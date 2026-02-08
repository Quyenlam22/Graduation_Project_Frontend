import React from 'react';
import { Typography, Row, Col, Card, Avatar, Flex, Button, Space, Divider } from 'antd';
import { PlayCircleFilled, HeartOutlined, MoreOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Album.scss';
import AlbumSection from '../../../components/Album/AlbumSection';

const { Title, Text } = Typography;

function Album() {
  const currentAlbum = {
    title: "Fine Line",
    artist: "Harry Styles",
    cover: "https://picsum.photos/500/500?random=1",
    release_date: "2019",
    nb_tracks: 12
  };

  return (
    <div className="album-detail-container">
      {/* SECTION 1: HERO & TRACKLIST */}
      <div className="album-hero">
        <div className="album-left">
          <img className="album-cover" src={currentAlbum.cover} alt="Album Cover" />
          <Flex vertical>
            <Title level={2} style={{ color: '#fff', margin: '15px 0 5px 0' }}>{currentAlbum.title}</Title>
            <Text style={{ color: '#FE2851', fontSize: '18px', display: 'block' }}>{currentAlbum.artist}</Text>
            <Text type="secondary" style={{ color: '#9CA3A1' }}>{currentAlbum.release_date} • {currentAlbum.nb_tracks} songs</Text>
            
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
              <Col span={16}><Text type="secondary" style={{ color: '#9CA3A1' }}>Bài hát</Text></Col>
              <Col span={4}><Text type="secondary" style={{ color: '#9CA3A1' }}>Yêu thích</Text></Col>
              <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined style={{ color: '#9CA3A1' }} /></Col>
            </Row>
          </div>
          
          <div className="track-list">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="track-item" key={i}>
                <Row align="middle" style={{ width: '100%' }}>
                  <Col span={1}>
                    <Text className="track-index">{i}</Text>
                  </Col>
                  <Col span={16}>
                    <Flex align="center" gap={15}>
                      <Avatar shape="square" size={40} src={`https://picsum.photos/100/100?random=${i+50}`} />
                      <div className="track-meta">
                        <Text strong className="song-name">Song Name {i}</Text>
                        <Text className="artist-name">{currentAlbum.artist}</Text>
                      </div>
                    </Flex>
                  </Col>
                  <Col span={4}>
                    <HeartOutlined style={{paddingLeft: "6px"}} className="favorite-icon" />
                  </Col>
                  <Col span={3} style={{ textAlign: 'right' }}>
                    <Text className="track-duration">3:45</Text>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider className="custom-divider" />

      {/* SECTION 2: OTHER ALBUMS (Thiết kế giống Home) */}
      <section style={{ marginBottom: 50 }}>
        <AlbumSection/>
      </section>
    </div>
  );
}

export default Album;