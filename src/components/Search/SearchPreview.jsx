import { useLocation } from "react-router-dom";
import { Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

function SearchPreview({ visible }) {
  const location = useLocation();
  const path = location.pathname;

  const dummyData = {
    albums: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `Album Tìm Thấy ${i}`, sub: "Artist Name", img: `https://picsum.photos/100/100?random=${i+10}` })),
    artists: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `Nghệ Sĩ Tìm Thấy ${i}`, sub: "2.4M followers", img: `https://i.pravatar.cc/100?img=${i+10}` })),
    playlists: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `Playlist Gợi Ý ${i}`, sub: "Muzia Flow", img: `https://picsum.photos/100/100?grayscale&random=${i+20}` })),
    songs: [1, 2, 3, 4, 5].map(i => ({ id: i, title: `Bài Hát Hot ${i}`, sub: "Singer Name", img: `https://picsum.photos/100/100?random=${i+30}` }))
  };

  let currentData = [];
  let label = "";
  let isCircle = false;

  if (path.includes("/albums")) {
    currentData = dummyData.albums;
    label = "RESULT ALBUM";
  } else if (path.includes("/artists")) {
    currentData = dummyData.artists;
    label = "RESULT ARTIST";
    isCircle = true;
  } else if (path.includes("/playlists")) {
    currentData = dummyData.playlists;
    label = "RESULT PLAYLIST";
    isCircle = true;
  } else {
    currentData = dummyData.songs;
    label = "RESULT SONGS";
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
         <Text className="view-all-text">See all result</Text>
      </div>
    </div>
  );
}

export default SearchPreview;