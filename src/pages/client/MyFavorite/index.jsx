import { Button, Tabs } from 'antd';
import { PlayCircleFilled } from '@ant-design/icons';
import './MyFavorite.scss';
import { useNavigate } from 'react-router';
import useTitle from '../../../hooks/useTitle';

function MyFavorite() {
  const navigate = useNavigate();

  useTitle("My Library")

  const onChange = (key) => {
    console.log(key);
  };

  // Nội dung khi chưa có dữ liệu (Empty State)
  const EmptyState = ({ message }) => (
    <div className="favorite__empty">
      <div className="favorite__empty-icon">
        <img src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/empty-fav-song-dark.png" alt="Empty" />
      </div>
      <p className="favorite__empty-text">{message}</p>
      <Button className="favorite__empty-btn" type="primary" shape="round" onClick={() => navigate("/")}>
        DISCOVER NOW
      </Button>
    </div>
  );

  const items = [
    {
      key: '1',
      label: 'SONG',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
        </div>
      ),
    },
    {
      key: '2',
      label: 'ALBUM',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
        </div>
      ),
    },
    {
      key: '3',
      label: 'ARTIST',
      children: (
        <div className="favorite__content">
           <div className="favorite__actions">
              <Button className="favorite__btn active" shape="round">LIKE</Button>
              {/* <Button className="favorite__btn" shape="round">ĐÃ TẢI LÊN</Button> */}
           </div>
           <EmptyState message="Don't have any favorite songs in my personal library yet." />
        </div>
      ),
    },
  ];

  return (
    <div className="favorite">
      <div className="favorite__header">
        <h2 className="favorite__title">My Library <PlayCircleFilled className="favorite__play-icon" /></h2>
      </div>

      <Tabs 
        defaultActiveKey="1" 
        items={items} 
        onChange={onChange} 
        className="favorite__tabs"
      />
    </div>
  );
}

export default MyFavorite;