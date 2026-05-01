import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Typography, Tabs, Row, Col, Avatar, Flex, Button, Spin, message, Tag } from 'antd';
import { PlayCircleFilled, HeartFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './MyFavorite.scss';
import useTitle from '../../../hooks/useTitle';
import { AuthContext } from "../../../Context/AuthProvider";
import { MusicContext } from "../../../Context/MusicContext";
import { getFavoriteSongsDetail } from "../../../services/songService";
import { toggleFavorite } from "../../../services/authService";
import { getFavoriteAlbumsDetail } from "../../../services/albumService";
import { getFavoritePlaylistsDetail } from "../../../services/playlistService";
import { getFavoriteArtistsDetail } from "../../../services/artistService";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const EmptyState = ({ message, navigate, t }) => (
  <div className="favorite__empty">
    <div className="favorite__empty-icon">
      <img src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/empty-fav-song-dark.png" alt="Empty" />
    </div>
    <p className="favorite__empty-text">{message}</p>
    <Button className="favorite__empty-btn" type="primary" shape="round" onClick={() => navigate("/")}>
      {t('common.discover_now')}
    </Button>
  </div>
);

function MyFavorite() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { playSong, currentSong, formatTime } = useContext(MusicContext);

  const [data, setData] = useState({ songs: [], albums: [], playlists: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const isFirstLoad = useRef(true);

  useTitle(t('sidebar.library'));

  useEffect(() => {
    const fetchAllFavorites = async () => {
      if (!user) return;
      if (isFirstLoad.current) setLoading(true);

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

    fetchAllFavorites();
  }, [
    user?.favorites?.songs?.length,
    user?.favorites?.albums?.length,
    user?.favorites?.playlists?.length,
    user?.favorites?.artists?.length
  ]);

  const handleRemoveFavorite = async (e, id, type) => {
    e.stopPropagation();
    try {
      const response = await toggleFavorite({ uid: user.uid, type, itemId: id });
      if (response.success) {
        setUser({ ...user, favorites: { ...user.favorites, [type]: response.updatedFavorites } });
        message.success(t('common.removed_favorite'));
      }
    } catch (error) {
      message.error(t('common.error_occurred'));
    }
  };

  const songListContent = useMemo(() => (
    <div className="playlist-tracks">
      <div className="tracklist-header">
        <Row align="middle">
          <Col span={1}><Text className="header-text">#</Text></Col>
          <Col span={12}><Text className="header-text">{t('common.songs_list')}</Text></Col>
          <Col span={6}><Text className="header-text">{t('album.title_prefix')}</Text></Col>
          <Col span={2} style={{ textAlign: 'center' }}><Text className="header-text">{t('common.source')}</Text></Col>
          <Col span={3} style={{ textAlign: 'right' }}><ClockCircleOutlined className="header-text" /></Col>
        </Row>
      </div>
      <div className="track-list">
        {data.songs.map((song, index) => (
          <div
            className={`track-item ${currentSong?._id === song._id ? 'active' : ''}`}
            key={`${song._id}-${index}`}
            onClick={() => playSong(song, data.songs, t('sidebar.library'))}
          >
            <Row align="middle" style={{ width: '100%' }}>
              <Col span={1}><Text className="track-index">{index + 1}</Text></Col>
              <Col span={12}>
                <Flex align="center" gap={15}>
                  <Avatar shape="square" size={40} src={song.cover || song.avatar} />
                  <div className="track-meta">
                    <Text strong className="song-name">{song.title}</Text>
                    <Text className="artist-name">{song.artistName}</Text>
                  </div>
                </Flex>
              </Col>
              <Col span={6}><Text className="album-text">{song.albumName || t('common.single')}</Text></Col>

              {/* CỘT HIỂN THỊ NGUỒN NHẠC */}
              <Col span={2} style={{ textAlign: 'center' }}>
                <div className={`source-badge ${song.source || 'local'}`}>
                  {song.source === 'deezer' ? 'Deezer' : 'Muzia'}
                </div>
              </Col>

              <Col span={3} className="track-actions">
                <HeartFilled className="heart-active" onClick={(e) => handleRemoveFavorite(e, song._id, 'songs')} />
                <Text className="track-duration">{formatTime(song.duration)}</Text>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    </div>
  ), [data.songs, currentSong?._id, t]);

  const renderGridView = (items, type, emptyMsg) => {
    if (items.length === 0) return <EmptyState message={emptyMsg} navigate={navigate} t={t} />;
    return (
      <Row gutter={[20, 25]} style={{ marginTop: '20px' }}>
        {items.map(item => (
          <Col xxl={4} xl={4} lg={6} md={8} sm={12} xs={12} key={item._id}>
            <div className="favorite-card" onClick={() => navigate(`/${type}/${item._id}`)}>
              <div className={`card-image ${type === 'artists' ? 'circle' : ''}`}>
                <img src={item.cover || item.avatar} alt={item.title || item.name} />
                <div className="overlay"><PlayCircleFilled className="play-icon" /></div>
                <HeartFilled className="btn-unfav" onClick={(e) => handleRemoveFavorite(e, item._id, type)} />
              </div>
              <div className="card-info">
                <Text strong className="title">{item.title || item.name}</Text>
                <Text className="subtitle">{type === 'artists' ? t('common.artist') : item.artistName || 'Muzia'}</Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const tabItems = [
    { key: 'songs', label: t('sidebar.songs'), children: data.songs.length > 0 ? songListContent : <EmptyState message={t('library.empty_songs')} navigate={navigate} t={t} /> },
    { key: 'albums', label: t('sidebar.albums'), children: renderGridView(data.albums, 'albums', t('library.empty_albums')) },
    { key: 'playlists', label: t('sidebar.playlists'), children: renderGridView(data.playlists, 'playlists', t('library.empty_playlists')) },
    { key: 'artists', label: t('sidebar.artists'), children: renderGridView(data.artists, 'artists', t('library.empty_artists')) },
  ];

  return (
    <div className="favorite">
      <div className="favorite__header">
        <h2 className="favorite__title">
          {t('sidebar.library')}
          {data.songs.length > 0 && <PlayCircleFilled className="favorite__play-icon" onClick={() => playSong(data.songs[0], data.songs, t('sidebar.library'))} />}
        </h2>
      </div>
      {loading ? (
        <Flex justify="center" align="center" style={{ padding: '100px' }}>
          <Spin size="large" />
          <Text style={{ marginLeft: 10 }}>{t('common.loading')}</Text>
        </Flex>
      ) : (
        <Tabs defaultActiveKey="songs" items={tabItems} className="favorite__tabs" />
      )}
    </div>
  );
}

export default MyFavorite;