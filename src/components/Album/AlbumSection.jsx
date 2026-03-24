import { Card, Col, Row, Typography, Pagination } from "antd";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { paginate } from "../../utils/paginate";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const { Text, Title } = Typography;

function AlbumSection(props) {
  const { albums, title, isSlider = false } = props;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const paginationData = useMemo(() => {
    return paginate(albums || [], currentPage, pageSize);
  }, [albums, currentPage]);

  if (!albums || albums.length === 0) return null;

  // --- TRƯỜNG HỢP 1: HIỂN THỊ DẠNG SLIDE (Dùng cho trang Home) ---
  if (isSlider) {
    return (
      <div className="section-slider">
        {title && <Title level={3} style={{ color: "#fff" }}>{title}</Title>}
        <Swiper
          modules={[Navigation, FreeMode, Autoplay]} // Thêm Autoplay vào đây
          spaceBetween={24}
          slidesPerView={2}
          freeMode={true}
          navigation={true}
          loop={true}
          autoplay={{
            delay: 2000, 
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
            1200: { slidesPerView: 4 },
            1400: { slidesPerView: 6 },
          }}
        >
          {albums.map((album) => (
            <SwiperSlide key={album._id}>
              <Card
                hoverable
                className="glass-card"
                onClick={() => navigate(`/albums/${album._id}`)}
                cover={<div className="album-img-container"><img alt={album.title} src={album.avatar} /></div>}
                styles={{ body: { padding: "0 12px 12px 12px" } }}
              >
                <Card.Meta 
                  title={<Title level={5} style={{ color: "#fff", margin: 0, fontSize: '14px' }}>{album.title}</Title>}
                  description={<Text type="secondary" style={{ fontSize: "12px", color: '#9CA3A1', overflow: "hidden", textWrap: "nowrap" }}>{album.artistName}</Text>}
                />
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: HIỂN THỊ DẠNG LƯỚI + PHÂN TRANG (Dùng cho trang /albums) ---
  return (
    <div className="album-section-grid">
      {title && <Title level={2} style={{ color: "#fff" }}>{title}</Title>}
      <Row gutter={[24, 24]}>
        {paginationData.currentItems.map((album) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={4} key={album._id}>
            <Card
              hoverable
              className="glass-card"
              onClick={() => navigate(`/albums/${album._id}`)}
              cover={<div className="album-img-container"><img alt={album.title} src={album.avatar} /></div>}
              styles={{ body: { padding: "0 12px 12px 12px" } }}
            >
              <Card.Meta 
                title={<Title level={5} style={{ color: "#fff", margin: 0, fontSize: '14px' }}>{album.title}</Title>}
                description={<Text type="secondary" style={{ fontSize: "12px", color: '#9CA3A1' }}>{album.artistName}</Text>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {paginationData.totalPage > 1 && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <Pagination
            current={currentPage}
            total={paginationData.quantityItem}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
}

export default AlbumSection;