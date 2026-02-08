import { Card, Col, Row, Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

function PlaylistSection () {
  return (
    <>
      <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map((i) => (
              <Col xs={12} sm={8} md={6} key={i}>
                  <Card
                      hoverable
                      className="playlist-card"
                      cover={
                          <div className="playlist-img-container">
                              <img alt="playlist" src={`https://picsum.photos/300/300?grayscale&random=${i+20}`} />
                              <PlayCircleFilled className="play-hover-btn" />
                          </div>
                      }
                  >
                      <Card.Meta 
                          title={<Text style={{ color: '#fff' }}>Workout Mix #{i}</Text>} 
                          description={<Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1'}}>Playlist • Muzia Flow</Text>} 
                      />
                  </Card>
              </Col>
          ))}
      </Row>
    </>
  )
}

export default PlaylistSection;