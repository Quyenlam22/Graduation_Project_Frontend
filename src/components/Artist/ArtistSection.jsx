import { Avatar, Col, Row, Typography, Flex } from "antd";
const { Text } = Typography;

function ArtistSection() {
  return (
    <Row gutter={[24, 24]}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col xs={12} sm={8} md={6} lg={4} key={i}>
          <Flex vertical align="center" className="artist-card-item" style={{ cursor: 'pointer' }}>
            <Avatar 
              size={120} 
              src={`https://i.pravatar.cc/150?img=${i + 20}`} 
              style={{ border: '2px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}
            />
            <Text strong style={{ color: '#fff', textAlign: 'center', display: 'block' }}>
                Other Artist {i}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>
                2.1M Listeners
            </Text>
          </Flex>
        </Col>
      ))}
    </Row>
  );
}

export default ArtistSection;