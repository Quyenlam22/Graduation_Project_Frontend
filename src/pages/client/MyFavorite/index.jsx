import { useContext, useEffect, useState, useRef } from "react";
import { Typography, Tabs, Row, Col, Avatar, Flex, Button, Spin, message } from 'antd';
import { PlayCircleFilled, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import './MyFavorite.scss';
import useTitle from '../../../hooks/useTitle';
import { AuthContext } from "../../../Context/AuthProvider";
import { MusicContext } from "../../../Context/MusicContext";
import { getFavoriteSongsDetail } from "../../../services/songService";
import { toggleFavorite } from "../../../services/authService";
import { getFavoriteAlbumsDetail } from "../../../services/albumService";
import { getFavoritePlaylistsDetail } from "../../../services/playlistService";
import { getFavoriteArtistsDetail } from "../../../services/artistService";

const { Text } = Typography;

function MyFavorite() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { playSong, isPlaying, currentSong, formatTime } = useContext(MusicContext);
  
  const [data, setData] = useState({ songs: [], albums: [], playlists: [], artists: [] });
  const [loading, setLoading] = useState(false);
  
  // Dùng Ref để tránh việc fetch đi fetch lại khi không cần thiết
  const isFirstLoad = useRef(true);

  useTitle("My Library");

  useEffect(() => {
    const fetchAllFavorites = async () => {
      // Chỉ hiện loading ở lần đầu tiên truy cập trang
      if (isFirstLoad.current) {
        setLoading(true);
      }

      try {
        const [songRes, albumRes, playlistRes, artistRes] = await Promise.all([
          getFavoriteSongsDetail(user?.favorites?.songs || []),
          getFavoriteAlbumsDetail(user?.favorites?.albums || []),
          getFavoritePlaylistsDetail(user?.favorites?.playlists || []),
          getFavoriteArtistsDetail(user?.favorites?.artists || [])
        ]);

        setData({
          songs: songRes?.success ? songRes.data : [],
          albums: albumRes?.success ? albumRes.data : [],
          playlists: playlistRes?.success ? playlistRes.data : [],
          artists: artistRes?.success ? artistRes.data : []
        });
      } catch (error) {
        console.error("Error loading library data:", error);
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };

    // Chỉ fetch khi user đã login và có thông tin favorites
    if (user) {
      fetchAllFavorites();
    }
  }, [user?.favorites?.songs?.length, user?.favorites?.albums?.length, user?.favorites?.playlists?.length, user?.favorites?.artists?.length]);
  // Chỉ lắng nghe sự thay đổi về độ dài mảng để tránh re-render vô tận

  const handleRemoveFavorite = async (e, id, type) => {
    e.stopPropagation();
    try {
      const response = await toggleFavorite({ uid: user.uid, type, itemId: id });
      if (response.success) {
        setUser({ ...user, favorites: { ...user.favorites, [type]: response.updatedFavorites } });
        message.success("Removed from library");
      }
    } catch (error) { message.error("Error updating favorites"); }
  };

  // --- RENDER SUB-COMPONENTS (Giữ nguyên logic hiển thị của bạn) ---
  const SongList = () => (
    <div className="playlist-tracks">
      <div className="tracklist-header">
        <Row align="middle">
          <Col span={1}><Text className="header-text">#</Text></Col>
          <Col span={14}><Text className="header-text">SONG</Text></Col>
          <Col span={6}><Text className="header-text">ALBUM</Text></Col>
          <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined className="header-text" /></Col>
        </Row>
      </div>
      <div className="track-list">
        {data.songs.map((song, index) => (
          <div className={`track-item ${currentSong?._id === song._id ? 'active' : ''}`} key={song._id} onClick={() => playSong(song, data.songs)}>
            <Row align="middle" style={{ width: '100%' }}>
              <Col span={1}><Text className="track-index">{index + 1}</Text></Col>
              <Col span={14}>
                <Flex align="center" gap={15}>
                  <Avatar shape="square" size={40} src={song.cover || song.avatar} />
                  <div className="track-meta">
                    <Text strong className="song-name">{song.title}</Text>
                    <Text className="artist-name">{song.artistName}</Text>
                  </div>
                </Flex>
              </Col>
              <Col span={6}><Text className="album-text">{song.albumName || "Single"}</Text></Col>
              <Col span={3} className="track-actions">
                <HeartFilled className="heart-active" onClick={(e) => handleRemoveFavorite(e, song._id, 'songs')} />
                <Text className="track-duration">{formatTime(song.duration)}</Text>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    </div>
  );

  const GridView = ({ items, type, emptyMsg }) => {
    if (items.length === 0) return <EmptyState message={emptyMsg} />;
    return (
      <Row gutter={[20, 25]} style={{ marginTop: '20px' }}>
        {items.map(item => (
          <Col xxl={4} xl={4} lg={6} md={8} sm={12} xs={12} key={item._id}>
            <div className="favorite-card" onClick={() => navigate(`/${type}/${item._id}`)}>
              <div className={`card-image ${type === 'artists' ? 'circle' : ''}`}>
                <img src={item.cover || item.avatar} alt={item.title} />
                <div className="overlay"><PlayCircleFilled className="play-icon" /></div>
                <HeartFilled className="btn-unfav" onClick={(e) => handleRemoveFavorite(e, item._id, type)} />
              </div>
              <div className="card-info">
                <Text strong className="title">{item.title || item.name}</Text>
                <Text className="subtitle">{type === 'artists' ? 'Artist' : item.artistName || 'Muzia User'}</Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const EmptyState = ({ message }) => (
    <div className="favorite__empty">
      <div className="favorite__empty-icon">
        <img src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/empty-fav-song-dark.png" alt="Empty" />
      </div>
      <p className="favorite__empty-text">{message}</p>
      <Button className="favorite__empty-btn" type="primary" shape="round" onClick={() => navigate("/")}>DISCOVER NOW</Button>
    </div>
  );

  const tabItems = [
    { key: 'songs', label: 'SONGS', children: data.songs.length > 0 ? <SongList /> : <EmptyState message="No liked songs yet." /> },
    { key: 'albums', label: 'ALBUMS', children: <GridView items={data.albums} type="albums" emptyMsg="No favorite albums yet." /> },
    { key: 'playlists', label: 'PLAYLISTS', children: <GridView items={data.playlists} type="playlists" emptyMsg="No favorite playlists yet." /> },
    { key: 'artists', label: 'ARTISTS', children: <GridView items={data.artists} type="artists" emptyMsg="No favorite artists yet." /> },
  ];

  return (
    <div className="favorite">
      <div className="favorite__header">
        <h2 className="favorite__title">My Library {data.songs.length > 0 && <PlayCircleFilled className="favorite__play-icon" onClick={() => playSong(data.songs[0], data.songs)} />}</h2>
      </div>
      {loading ? (
        <Flex justify="center" align="center" style={{ padding: '100px' }}>
          <Spin size="large" tip="Loading Library..." />
        </Flex>
      ) : (
        <Tabs defaultActiveKey="songs" items={tabItems} className="favorite__tabs" />
      )}
    </div>
  );
}

export default MyFavorite;