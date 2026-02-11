import { Button, Card, Avatar, Typography, Flex, Divider, Row, Col } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import "./Home.scss"; // Đừng quên import file scss nhé
import AlbumSection from "../../../components/Album/AlbumSection";
import PlaylistSection from "../../../components/Playlist/PlaylistSection";

const { Title, Text } = Typography;

function Home() {
    useTitle("Muzia");

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
                    <Link to={"/playlists"} className="see-all">View all</Link>
                </Flex>
                <PlaylistSection/>
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
                    <Flex justify="space-between" align="baseline" className="section-title-container">
                        <Title level={4} style={{ color: "#fff" }} className="section-title">Top Artists</Title>
                        <Link to={"/artists"} className="see-all">See all</Link>
                    </Flex>
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