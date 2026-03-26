import { useEffect, useState, useContext, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, Spin, Typography, Row, Col, Empty, Flex, Pagination, Card, message } from 'antd'; 
import { HeartOutlined, HeartFilled } from '@ant-design/icons'; // Thêm icon
import { SongContext } from '../../../Context/SongContext';
import { AlbumContext } from '../../../Context/AlbumContext';
import { ArtistContext } from '../../../Context/ArtistContext';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { MusicContext } from '../../../Context/MusicContext';
import { AuthContext } from '../../../Context/AuthProvider'; // Thêm AuthContext
import { searchDeezer } from '../../../services/dezzerService';
import { toggleFavorite } from '../../../services/authService'; // Thêm service toggle
import { useTranslation } from 'react-i18next';
import { paginate } from '../../../utils/paginate'; 
import './SearchResult.scss';

const { Title, Text } = Typography;

function SearchResult() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); 

  const { user, setUser } = useContext(AuthContext); // Lấy user từ Context
  const { songs: dbSongs, refreshSongs } = useContext(SongContext);
  const { albums: dbAlbums, refreshAlbums } = useContext(AlbumContext);
  const { artists: dbArtists, refreshArtists } = useContext(ArtistContext);
  const { playlists: dbPlaylists, refreshPlaylists } = useContext(PlaylistContext);
  const { playSong } = useContext(MusicContext);

  useEffect(() => {
    refreshSongs();
    refreshAlbums();
    refreshArtists();
    refreshPlaylists();
  }, []);
  
  const [deezerSongs, setDeezerSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [songPage, setSongPage] = useState(1);
  const [albumPage, setAlbumPage] = useState(1);
  const [artistPage, setArtistPage] = useState(1);
  const [playlistPage, setPlaylistPage] = useState(1);
  
  const limitItems = 10;
  const gridLimit = 12;

  // --- HÀM XỬ LÝ SỰ KIỆN TIM ---
  const handleToggleFavorite = async (e, song) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra div cha (tránh tự động phát nhạc)
    
    if (!user) {
      message.error(t('auth.login_required'));
      return;
    }

    try {
      const response = await toggleFavorite({
        uid: user.uid,
        type: 'songs',
        itemId: song._id
      });

      if (response.success) {
        setUser({
          ...user,
          favorites: {
            ...user.favorites,
            songs: response.updatedFavorites
          }
        });
        
        const isAdded = response.updatedFavorites.includes(song._id);
        message.success(isAdded ? t('common.added_favorite') : t('common.removed_favorite'));
      }
    } catch (error) {
      message.error(t('common.error_occurred'));
    }
  };

  useEffect(() => { 
    setSongPage(1); 
    setAlbumPage(1);
    setArtistPage(1);
    setPlaylistPage(1);
  }, [query]);

  useEffect(() => {
    const fetchExternalData = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const result = await searchDeezer(query);
        setDeezerSongs(result?.data || []);
      } catch (err) { console.error(err); setDeezerSongs([]); }
      finally { setLoading(false); }
    };
    fetchExternalData();
  }, [query]);

  const lowQuery = query?.toLowerCase() || "";

  const mergedSongs = useMemo(() => {
    const localMatches = dbSongs.filter(s => s.title.toLowerCase().includes(lowQuery) || s.artistName?.toLowerCase().includes(lowQuery))
      .map(s => ({ ...s, source: 'local', fingerprint: `${s.title.toLowerCase().trim()}|${s.artistName?.toLowerCase().trim()}` }));
    const localFingerprints = new Set(localMatches.map(s => s.fingerprint));
    const externalMatches = deezerSongs.map(s => ({
      _id: `dz_${s.id}`,
      deezerId: s.id,
      title: s.title,
      artistName: s.artist.name,
      cover: s.album.cover_medium,
      duration: s.duration,
      src: s.preview,
      source: 'deezer',
      fingerprint: `${s.title.toLowerCase().trim()}|${s.artist.name.toLowerCase().trim()}`
    })).filter(s => !localFingerprints.has(s.fingerprint));
    return [...localMatches, ...externalMatches];
  }, [lowQuery, dbSongs, deezerSongs]);

  const filteredAlbums = useMemo(() => dbAlbums.filter(a => a.title.toLowerCase().includes(lowQuery) || a.artistName?.toLowerCase().includes(lowQuery)), [lowQuery, dbAlbums]);
  const filteredArtists = useMemo(() => dbArtists.filter(a => a.name.toLowerCase().includes(lowQuery)), [lowQuery, dbArtists]);
  const filteredPlaylists = useMemo(() => dbPlaylists.filter(p => p.title.toLowerCase().includes(lowQuery)), [lowQuery, dbPlaylists]);

  const songPagination = useMemo(() => paginate(mergedSongs, songPage, limitItems), [mergedSongs, songPage]);

  const renderGridWithPagination = (data, type, currentPage, setPage) => {
    const pData = paginate(data, currentPage, gridLimit);
    return (
      <div className="grid-container" style={{ marginTop: '20px' }}>
        <Row gutter={[20, 20]}>
          {pData.currentItems.length > 0 ? (
            pData.currentItems.map((item) => (
              <Col xs={12} sm={8} md={6} lg={4} key={item._id}>
                <Card
                  hoverable
                  className="glass-card"
                  onClick={() => navigate(`/${type}/${item._id}`)}
                  cover={
                    <div className="album-img-container">
                      <img alt={item.title || item.name} src={item.avatar || item.cover} className={type === 'artists' ? 'artist-img' : ''} />
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Text strong style={{ color: '#fff', fontSize: '14px' }}>{type === 'artists' ? item.name : item.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>{type === 'artists' ? t('common.artist') : item.artistName}</Text>}
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}><Empty description={<span style={{ color: '#9CA3A1' }}>{t('search.no_results')}</span>} /></Col>
          )}
        </Row>
        {pData.totalPage > 1 && (
          <Flex justify="center" style={{ marginTop: '30px' }}>
            <Pagination showSizeChanger={false} current={currentPage} total={data.length} pageSize={gridLimit} onChange={setPage} className="custom-pagination" />
          </Flex>
        )}
      </div>
    );
  };

  const tabItems = [
    {
      key: 'songs',
      label: t('search.songs'),
      children: (
        loading ? <Flex justify="center" p={50}><Spin size="large" /></Flex> : (
            <div className="song-grid">
              <Row gutter={[16, 16]}>
                {songPagination.currentItems.map((song, index) => {
                  const isLiked = user?.favorites?.songs?.includes(song._id);

                  return (
                    <Col span={24} key={song._id}>
                      <div className="search-song-item" onClick={() => playSong(song, mergedSongs, `${t('search.result_for')}: ${query}`)}>
                        <Flex align="center" justify="space-between">
                          <Flex align="center" gap={15}>
                            <Text className="index">{(songPage - 1) * limitItems + index + 1}</Text>
                            <img src={song.cover || song.avatar} alt={song.title} className="song-cover" />
                            <div className="info">
                              <Text strong className="title" style={{ color: '#fff' }}>{song.title}</Text><br />
                              <Text className="artist" style={{ color: '#9CA3A1' }}>{song.artistName}</Text>
                            </div>
                          </Flex>
                          
                          <Flex align="center" gap={20}>
                            {/* NÚT TIM */}
                            <div 
                              className="heart-icon-wrapper" 
                              onClick={(e) => handleToggleFavorite(e, song)}
                              style={{ cursor: 'pointer', fontSize: '18px' }}
                            >
                              {isLiked ? (
                                <HeartFilled style={{ color: '#FE2851' }} />
                              ) : (
                                <HeartOutlined style={{ color: '#9CA3A1' }} className="heart-hover" />
                              )}
                            </div>

                            <div className={`source-badge ${song.source}`}>
                              {song.source === 'local' ? 'Muzia' : 'Deezer'}
                            </div>
                          </Flex>
                        </Flex>
                      </div>
                    </Col>
                  );
                })}
              </Row>
              <Pagination showSizeChanger={false} current={songPage} total={mergedSongs.length} pageSize={limitItems} onChange={setSongPage} className="custom-pagination" style={{ marginTop: 20, textAlign: 'center' }} />
            </div>
        )
      )
    },
    { key: 'albums', label: t('menu.albums'), children: renderGridWithPagination(filteredAlbums, 'albums', albumPage, setAlbumPage) },
    { key: 'artists', label: t('menu.artists'), children: renderGridWithPagination(filteredArtists, 'artists', artistPage, setArtistPage) },
    { key: 'playlists', label: t('menu.playlists'), children: renderGridWithPagination(filteredPlaylists, 'playlists', playlistPage, setPlaylistPage) },
  ];

  return (
    <div className="search-result-page">
      <div className="search-result-header">
        <Title level={2} style={{ color: '#fff' }}>{t('search.result_for')} "{query}"</Title>
      </div>
      <Tabs defaultActiveKey="songs" items={tabItems} className="custom-tabs" />
    </div>
  );
}

export default SearchResult;