import { useContext } from "react";
import { Button, Card, Avatar, Typography, Flex, Divider, Row, Col } from "antd";
import { PlayCircleFilled, CustomerServiceOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import useTitle from "../../../hooks/useTitle";
import "./Home.scss"; // Đừng quên import file scss nhé
import AlbumSection from "../../../components/Album/AlbumSection";

const { Title, Text } = Typography;

function Home() {
    const { user } = useContext(AuthContext);
    useTitle("Muzia");

    if (!user) return (
        <Flex justify="center" align="center" style={{ minHeight: '80vh' }}>
            <Card className="glass-card" style={{ textAlign: "center", width: 400 }}>
                <CustomerServiceOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 20 }} />
                <Title level={3} style={{ color: '#fff' }}>Welcome to Muzia</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                    Log in to discover and stream your favorite music flow.
                </Text>
                <Link to="/auth"><Button type="primary" size="large" block shape="round">Login Now</Button></Link>
            </Card>
        </Flex>
    );

    return (
        <div className="home-container">

            {/* HERO SECTION */}
            <div className="hero-section">
                <div className="featured-badge">Featured Artist</div>
                <h1 className="hero-title">Luna Eclipse</h1>
                <Text className="hero-subtitle">Pop  •  2.4M followers</Text>
                <Flex gap={15} className="hero-buttons">
                    <Button type="primary" size="large" icon={<PlayCircleFilled />} shape="round" className="btn-play">
                        Play Now
                    </Button>
                    <Button ghost size="large" shape="round" className="btn-profile">
                        View Profile
                    </Button>
                </Flex>
            </div>

            {/* SUGGESTED SECTION */}
            <section style={{ marginBottom: 50 }}>
                <Flex justify="space-between" align="baseline" className="section-title-container">
                    <Title level={4} className="section-title">Suggested for you</Title>
                    <Link to={"/albums"} className="see-all">See all</Link>
                </Flex>
                <AlbumSection/>
            </section>

            <section style={{ marginBottom: 50 }}>
                <Flex justify="space-between" align="baseline" className="section-title-container">
                    <Title level={4} className="section-title">Your Playlists</Title>
                    <Text type="secondary" className="see-all">View all</Text>
                </Flex>
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
            </section>

            <Row gutter={40}>
                {/* NEW RELEASES */}
                <Col span={16}>
                    <Flex justify="space-between" align="baseline" className="section-title-container">
                        <Title level={4} className="section-title">New Releases</Title>
                        {/* <Text type="secondary" className="see-all">See all</Text> */}
                    </Flex>
                    <div className="new-release-list">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="new-release-item">
                                <Text className="track-number">{i}</Text>
                                <Avatar shape="square" size={48} src={`https://picsum.photos/100/100?random=${i+10}`} />
                                <div className="track-info">
                                    <Text strong className="song-name">Song Title {i}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>Artist Name</Text>
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px', color: '#95a9e4'}}>3:45</Text>
                                <PlayCircleFilled className="play-icon" />
                            </div>
                        ))}
                    </div>
                </Col>

                {/* SIDEBAR ARTISTS */}
                <Col span={8}>
                    <Title level={4} className="section-title" style={{ marginBottom: 20, color: "#fff" }}>Top Artists</Title>
                    <Flex vertical gap={20}>
                        {[1, 2, 3].map((i) => (
                            <Flex align="center" gap={15} key={i} className="artist-item">
                                <Avatar size={54} src={`https://i.pravatar.cc/150?img=${i+10}`} />
                                <div>
                                    <Text strong className="artist-name">Artist Name {i}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>1.2M Monthly Listeners</Text>
                                </div>
                            </Flex>
                        ))}
                    </Flex>
                </Col>
            </Row>

            <Divider className="custom-divider" />
        </div>
    );
}

export default Home;