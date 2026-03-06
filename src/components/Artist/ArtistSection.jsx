import { Avatar, Col, Row, Typography, Flex, ConfigProvider, Pagination } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import { paginate } from "../../utils/paginate";
import 'swiper/css';
import 'swiper/css/navigation';

const { Text, Title } = Typography;

function ArtistSection(props) {
  const { artists, title, isSlider = false } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const paginationData = useMemo(() => {
    return paginate(artists || [], currentPage, pageSize);
  }, [artists, currentPage]);

  const lgValue = pathname === "/artists" ? 4 : 4; // image_fab601 cho thấy 6 cột trên màn hình lớn

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const renderArtistItem = (artist) => (
    <Flex 
      vertical 
      align="center" 
      className="artist-card-item" 
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/artists/${artist._id}`)}
    >
      <Avatar 
        size={140} 
        src={artist.avatar} 
        style={{ border: '2px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}
      />
      <Text strong style={{ color: '#fff', textAlign: 'center', display: 'block', fontSize: '16px' }}>
        {artist.name}
      </Text>
      <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>
        {/* Ưu tiên hiển thị nb_fan, nếu không có thì đếm độ dài mảng like */}
        {artist.nb_fan ? formatNumber(artist.nb_fan) : formatNumber(artist.like?.length)} Listeners
      </Text>
    </Flex>
  );

  if (!artists || artists.length === 0) return null;

  if (isSlider) {
    return (
      <div className="artist-section-slider">
        {title && <Title level={4} style={{ color: "#fff", marginBottom: 25 }}>{title}</Title>}
        <Swiper
          modules={[Navigation, FreeMode, Autoplay]}
          spaceBetween={24}
          slidesPerView={2}
          freeMode={true}
          navigation={true}
          loop={artists.length > 6}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
        >
          {artists.map((artist) => (
            <SwiperSlide key={artist._id}>{renderArtistItem(artist)}</SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className="artist-grid-container">
      <Row gutter={[24, 40]}>
        {paginationData.currentItems.map((artist) => (
          <Col xs={12} sm={8} md={6} lg={lgValue} key={artist._id}>
            {renderArtistItem(artist)}
          </Col>
        ))}
      </Row>

      {paginationData.totalPage > 1 && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <ConfigProvider
            theme={{
              components: {
                Pagination: {
                  colorPrimary: '#FE2851',
                  itemBg: 'transparent',
                  colorText: '#9CA3A1',
                },
              },
            }}
          >
            <Pagination
              current={currentPage}
              total={paginationData.quantityItem}
              pageSize={pageSize}
              onChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showSizeChanger={false}
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}

export default ArtistSection;