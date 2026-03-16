import { Button, Card, Avatar, Typography, Flex, Divider, Row, Col } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import "./Home.scss"; 
import AlbumSection from "../../../components/Album/AlbumSection";
import PlaylistSection from "../../../components/Playlist/PlaylistSection";
import { useContext, useMemo } from "react";
import { AlbumContext } from "../../../Context/AlbumContext";
import { PlaylistContext } from "../../../Context/PlaylistContext";
import { SongContext } from "../../../Context/SongContext";
import { ArtistContext } from "../../../Context/ArtistContext";
import { MusicContext } from "../../../Context/MusicContext";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

function Home() {
    const { t } = useTranslation();
    const { albums } = useContext(AlbumContext);
    const { playlists } = useContext(PlaylistContext);
    const { songs } = useContext(SongContext);
    const { artists } = useContext(ArtistContext);
    const { playSong } = useContext(MusicContext);
    const navigate = useNavigate();
    
    useTitle("Muzia");

    const newReleases = useMemo(() => {
        if (!songs || songs.length === 0) return [];
        return [...songs]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4); 
    }, [songs]);

    const topArtists = useMemo(() => {
        if (!artists || artists.length === 0) return [];
        return [...artists]
            .sort((a, b) => b.nb_fan - a.nb_fan)
            .slice(0, 3);
    }, [artists]);

    const formatTime = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <div className="featured-badge">{t('home.welcome')}</div>
                <h1 className="hero-title">{t('home.hero_title')}</h1>
                <Text className="hero-subtitle">
                    {t('home.hero_subtitle')}
                </Text>
                <Flex gap={15} className="hero-buttons">
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlayCircleFilled />} 
                        shape="round" 
                        className="btn-play"
                        onClick={() => newReleases.length > 0 && playSong(newReleases[0], newReleases, t('home.new_releases'))}
                    >
                        {t('home.btn_start')}
                    </Button>
                    <Button 
                        ghost 
                        size="large" 
                        shape="round" 
                        className="btn-profile"
                        onClick={() => navigate("/artists")}
                    >
                        {t('home.btn_explore')}
                    </Button>
                </Flex>
            </div>

            {/* SUGGESTED SECTION */}
            <section style={{ marginBottom: 50 }}>
                <Flex justify="space-between" align="baseline" className="section-title-container">
                    <Title level={4} className="section-title">{t('home.suggested')}</Title>
                    <Link to={"/albums"} className="see-all">{t('common.see_all')}</Link>
                </Flex>
                <AlbumSection albums={albums} isSlider={true} />
            </section>

            <section style={{ marginBottom: 50 }}>
                <Flex justify="space-between" align="baseline" className="section-title-container">
                    <Title level={4} className="section-title">{t('home.trending_playlists')}</Title>
                    <Link to={"/playlists"} className="see-all">{t('common.view_all')}</Link>
                </Flex>
                <PlaylistSection playlists={playlists} isSlider={true} albums={albums} />
            </section>

            <Row gutter={40}>
                {/* NEW RELEASES */}
                <Col span={16}>
                    <Flex justify="space-between" align="baseline" className="section-title-container">
                        <Title level={4} className="section-title">{t('home.new_releases')}</Title>
                    </Flex>
                    <div className="new-release-list">
                        {newReleases.map((song, index) => (
                            <div 
                                key={song._id} 
                                className="new-release-item"
                                onClick={() => playSong(song, newReleases, t('home.new_releases'))}
                                style={{ cursor: 'pointer' }}
                            >
                                <Text className="track-number">{index + 1}</Text>
                                <Avatar shape="square" size={48} src={song.cover || song.avatar} />
                                <div className="track-info">
                                    <Text strong className="song-name">{song.title}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>
                                        {song.artistName}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px', color: '#95a9e4' }}>
                                    {formatTime(song.duration)}
                                </Text>
                                <PlayCircleFilled className="play-icon" />
                            </div>
                        ))}

                        {newReleases.length === 0 && (
                            <Text type="secondary" style={{ padding: '10px', display: 'block' }}>
                                {t('home.no_new_songs')}
                            </Text>
                        )}
                    </div>
                </Col>

                {/* SIDEBAR ARTISTS */}
                <Col span={8}>
                    <Flex justify="space-between" align="baseline" className="section-title-container">
                        <Title level={4} style={{ color: "#fff" }} className="section-title">{t('home.top_artists')}</Title>
                        <Link to={"/artists"} className="see-all">{t('common.see_all')}</Link>
                    </Flex>
                    <Flex vertical gap={20}>
                        {topArtists.map((artist) => (
                            <Flex 
                                align="center" 
                                gap={15} 
                                key={artist._id} 
                                className="artist-item"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/artists/${artist._id}`)}
                            >
                                <Avatar size={54} src={artist.avatar} />
                                <Flex vertical>
                                    <Text strong className="artist-name" style={{ color: '#fff' }}>
                                        {artist.name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>
                                        {artist.nb_fan ? artist.nb_fan.toLocaleString() : (artist.like?.length || 0)} {t('common.fans')}
                                    </Text>
                                </Flex>
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