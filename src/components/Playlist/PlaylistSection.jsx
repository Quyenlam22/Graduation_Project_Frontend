import { Card, Col, ConfigProvider, Pagination, Row, Typography } from "antd";
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
  let lgValue;
  let breakpoints;
  if (pathname.includes("/playlists")) {
    lgValue = 4; // 6 cột khi ở trang danh sách tổng
    breakpoints = {
      640: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      1024: { slidesPerView: 6 },
    };
  } else {
    lgValue = 6; // 4 cột khi ở các mục Suggested/Home
    breakpoints = {
      640: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      1024: { slidesPerView: 4 },
    };
  }

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
      <div className="playlist-section-slider">
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
      <Row gutter={[24, 24]}>
        {/* SỬA TẠI ĐÂY: Dùng paginationData.currentItems thay vì playlists */}
        {paginationData.currentItems.map((item) => (
          <Col xs={12} sm={8} md={6} lg={lgValue} key={item._id}>
            {renderCard(item)}
          </Col>
        ))}
      </Row>

      {/* Điều khiển phân trang */}
      {paginationData.totalPage > 1 && (
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <ConfigProvider
            theme={{
              components: {
                Pagination: {
                  colorText: '#9CA3A1', 
                  colorTextDisabled: '#444',
                  colorPrimary: '#FE2851', 
                  colorPrimaryHover: '#ff4d6d',
                  colorTextPlaceholder: '#fff',
                  itemBg: 'transparent',
                  controlItemBgActive: 'rgba(254, 40, 81, 0.1)', 
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
                // Cuộn lên đầu khi chuyển trang để có trải nghiệm tốt hơn
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

export default PlaylistSection;