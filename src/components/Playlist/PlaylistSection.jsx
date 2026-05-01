import { Card, Col, Pagination, Row, Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { paginate } from "../../utils/paginate";
import { useMemo, useState } from "react";

const { Text } = Typography;

function PlaylistSection(props) {
  const { playlists, isSlider } = props;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const paginationData = useMemo(() => {
    return paginate(playlists || [], currentPage, pageSize);
  }, [playlists, currentPage]);

  let xlValue = pathname.includes("/playlists") ? 4 : 6;

  const breakpoints = {
    320: { slidesPerView: 2, spaceBetween: 15 },
    640: { slidesPerView: 3, spaceBetween: 20 },
    1024: { slidesPerView: pathname.includes("/playlists") ? 6 : 4, spaceBetween: 24 },
  };

  const renderCard = (playlist) => (
    <Card
      hoverable
      className="playlist-card"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
      cover={
        <div className="playlist-img-container">
          <img alt={playlist.title} src={playlist.avatar} />
          <PlayCircleFilled className="play-hover-btn" />
        </div>
      }
    >
      <div className="playlist-card-body">
        <div className="title-wrapper">
          <div className="playlist-title-marquee">
            {playlist.title}
          </div>
        </div>
        <div className="playlist-author">
          {playlist.userId === 'system' ? 'System' : (playlist.userId?.displayName || "Muzia Flow")}
        </div>
      </div>
    </Card>
  );

  if (!playlists || playlists.length === 0) return null;

  if (isSlider) {
    return (
      <div className="section-slider">
        <Swiper
          modules={[Navigation, FreeMode, Autoplay]}
          spaceBetween={24}
          slidesPerView={2}
          freeMode={true}
          navigation={true}
          loop={playlists.length > 6}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={breakpoints}
        >
          {playlists.map((item) => (
            <SwiperSlide key={item._id}>
              {renderCard(item)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className="playlist-section-grid">
      <Row gutter={[16, 24]}>
        {paginationData.currentItems.map((item) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={xlValue} key={item._id}>
            {renderCard(item)}
          </Col>
        ))}
      </Row>

      {paginationData.totalPage > 1 && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <Pagination
            current={currentPage}
            total={paginationData.quantityItem}
            pageSize={pageSize}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
}

export default PlaylistSection;