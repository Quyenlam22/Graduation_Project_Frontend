import { useLocation } from "react-router-dom";
import { Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

function SearchPreview({ visible }) {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;

  const dummyData = {
    albums: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `${t('search.found_album')} ${i}`, sub: "Artist Name", img: `https://picsum.photos/100/100?random=${i+10}` })),
    artists: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `${t('search.found_artist')} ${i}`, sub: "2.4M followers", img: `https://i.pravatar.cc/100?img=${i+10}` })),
    playlists: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `${t('search.suggested_playlist')} ${i}`, sub: "Muzia Flow", img: `https://picsum.photos/100/100?grayscale&random=${i+20}` })),
    songs: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `${t('search.hot_song')} ${i}`, sub: "Singer Name", img: `https://picsum.photos/100/100?random=${i+30}` }))
  };

  let currentData = [];
  let label = "";
  let isCircle = false;

  if (path.includes("/albums")) {
    currentData = dummyData.albums;
    label = t('search.result_album');
  } else if (path.includes("/artists")) {
    currentData = dummyData.artists;
    label = t('search.result_artist');
    isCircle = true;
  } else if (path.includes("/playlists")) {
    currentData = dummyData.playlists;
    label = t('search.result_playlist');
    isCircle = true;
  } else {
    currentData = dummyData.songs;
    label = t('search.result_songs');
  }

  if (!visible) return null;

  return (
    <div className="search-preview-wrapper">
      <div className="preview-header">
        <span className="label">{label}</span>
      </div>
      {currentData.map((item) => (
        <div className="preview-item" key={item.id}>
          <img 
            src={item.img} 
            alt="thumb" 
            className={`preview-img ${isCircle ? 'circle' : ''}`} 
          />
          <div className="preview-info">
            <Text className="title" ellipsis>{item.title}</Text>
            <Text className="sub-title" ellipsis>{item.sub}</Text>
          </div>
          <PlayCircleFilled className="play-icon-hover" />
        </div>
      ))}
      <div className="preview-footer">
         <Text className="view-all-text">{t('search.see_all')}</Text>
      </div>
    </div>
  );
}

export default SearchPreview;