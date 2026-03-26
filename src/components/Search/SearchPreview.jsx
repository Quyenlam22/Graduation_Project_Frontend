import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Spin, Empty } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useContext, useMemo } from "react";
import { AlbumContext } from "../../Context/AlbumContext";
import { ArtistContext } from "../../Context/ArtistContext";
import { PlaylistContext } from "../../Context/PlaylistContext";
import { SongContext } from "../../Context/SongContext";
import { MusicContext } from "../../Context/MusicContext";
import { useEffect } from "react";

const { Text } = Typography;

function SearchPreview({ visible, keyword }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const { songs, refreshSongs } = useContext(SongContext);
  const { albums, refreshAlbums } = useContext(AlbumContext);
  const { artists, refreshArtists } = useContext(ArtistContext);
  const { playlists, refreshPlaylists } = useContext(PlaylistContext);
  const { playSong } = useContext(MusicContext);

  useEffect(() => {
    refreshSongs();
    refreshAlbums();
    refreshArtists();
    refreshPlaylists();
  }, []);

  const filteredData = useMemo(() => {
    if (!keyword) return { results: [], label: "", type: "" };

    const lowKeyword = keyword.toLowerCase();
    
    if (path.includes("/albums")) {
      const res = albums.filter(a => a.title.toLowerCase().includes(lowKeyword)).slice(0, 5);
      return { results: res, label: t('search.result_album'), type: 'album', isCircle: false };
    } 
    if (path.includes("/artists")) {
      const res = artists.filter(a => a.name.toLowerCase().includes(lowKeyword)).slice(0, 5);
      return { results: res, label: t('search.result_artist'), type: 'artist', isCircle: true };
    } 
    if (path.includes("/playlists")) {
      const res = playlists.filter(a => a.title.toLowerCase().includes(lowKeyword)).slice(0, 5);
      return { results: res, label: t('search.result_playlist'), type: 'playlist', isCircle: true };
    } 
    
    // Mặc định tìm kiếm bài hát
    const res = songs.filter(s => s.title.toLowerCase().includes(lowKeyword)).slice(0, 5);
    return { results: res, label: t('search.result_songs'), type: 'song', isCircle: false };
  }, [keyword, path, songs, albums, artists, playlists, t]);

  if (!visible) return null;

  return (
    <div className="search-preview-wrapper">
      <div className="preview-header">
        <span className="label">{filteredData.label}</span>
      </div>

      {filteredData.results.length > 0 ? (
        filteredData.results.map((item) => (
          <div 
            className="preview-item" 
            key={item._id} 
            onClick={() => {
              if (filteredData.type === 'song') {
                playSong(item, filteredData.results, "Search Result");
              } else {
                navigate(`/${filteredData.type}s/${item._id}`);
              }
            }}
          >
            <img 
              src={item.avatar || item.cover} 
              alt="thumb" 
              className={`preview-img ${filteredData.isCircle ? 'circle' : ''}`} 
            />
            <div className="preview-info">
              <Text className="title" ellipsis>{item.title || item.name}</Text>
              <Text className="sub-title" ellipsis>
                {item.artistName || (item.nb_fan ? `${item.nb_fan} Fans` : "Muzia")}
              </Text>
            </div>
            <PlayCircleFilled className="play-icon-hover" />
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Text type="secondary" style={{color: "rgba(255,255,255,0.5)"}}>{t('search.no_result_db')}</Text>
        </div>
      )}

      <div className="preview-footer" onClick={() => navigate(`/search-all?q=${keyword}`)}>
         <Text className="view-all-text">{t('search.see_all')}</Text>
      </div>
    </div>
  );
}

export default SearchPreview;