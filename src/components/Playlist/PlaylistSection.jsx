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
  
  // 1. Quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  
  // 2. Sử dụng hàm paginate để lấy dữ liệu cho trang hiện tại
  const paginationData = useMemo(() => {
      return paginate(playlists || [], currentPage, pageSize);
  }, [playlists, currentPage]);
  
  // Logic hiển thị cột dựa trên đường dẫn
  let xlValue = pathname.includes("/playlists") ? 4 : 6;
  
  // Tối ưu Breakpoints cho Swiper (Mobile hiện 2, Tablet 3-4, Desktop 4-6)
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
      <Card.Meta
        title={<Text style={{ color: '#fff' }}>{playlist.title}</Text>}
        description={
          <Text type="secondary" style={{ fontSize: '12px', color: '#9CA3A1' }}>
            {playlist.userId || "Muzia Flow"}
          </Text>
        }
      />
    </Card>
  );

  if (!playlists || playlists.length === 0) return null;

  // --- TRƯỜNG HỢP 1: SLIDE (Dùng ở Home) ---
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

  // --- TRƯỜNG HỢP 2: LƯỚI + PHÂN TRANG (Dùng ở /playlists) ---
  return (
    <div className="playlist-section-grid">
      <Row gutter={[16, 24]}>
        {/* SỬA TẠI ĐÂY: Dùng paginationData.currentItems thay vì playlists */}
        {paginationData.currentItems.map((item) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={xlValue} key={item._id}>
            {renderCard(item)}
          </Col>
        ))}
      </Row>

      {/* Điều khiển phân trang */}
      {paginationData.totalPage > 1 && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <Pagination
            current={currentPage}
            total={paginationData.quantityItem}
            pageSize={pageSize}
            onChange={(page) => {
              setCurrentPage(page);
              // Cuộn lên đầu khi chuyển trang để có trải nghiệm tốt hơn
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