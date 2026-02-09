import { Card, Col, Row, Typography } from "antd";

const { Text } = Typography;

function AlbumSection () {
  return (
    <>
      <Row gutter={[24, 24]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={12} sm={8} md={6} lg={4} key={i}>
                  <Card
                      hoverable
                      className="glass-card"
                      cover={
                          <div className="album-img-container">
                              <img alt="album" src={`https://picsum.photos/300/300?random=${i}`} />
                          </div>
                      }
                      styles={{ body: {padding: '0 12px 12px 12px'} }}
                  >
                      <Card.Meta 
                          title={<Text style={{ color: '#fff' }}>Album Title {i}</Text>} 
                          description={<Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1'}}>Artist Name</Text>} 
                      />
                  </Card>
              </Col>
          ))}
      </Row>
    </>
  )
}

export default AlbumSection;