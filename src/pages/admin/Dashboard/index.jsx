import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../Context/DashboardContext"; // Import Context mới
import { Button, Flex, Typography, Row, Col, Card, Spin, Statistic, Image, Badge } from "antd";
import {
  UserOutlined, CustomerServiceOutlined,
  BuildOutlined, GlobalOutlined, ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";
import { Column, Line } from "@ant-design/plots";

const { Title, Text } = Typography;

function Dashboard() {
  const { stats, loading, refreshStats, isFetched } = useContext(DashboardContext); // Lấy data từ Context
  const navigate = useNavigate();
  const { messageApi } = useContext(AppContext);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isFetched && !loading) {
      refreshStats();
    }
  }, [isFetched, loading, refreshStats]);

  // Hàm làm mới dữ liệu thủ công
  const onManualRefresh = () => {
    refreshStats(true);
    messageApi.open({
      type: 'loading',
      content: 'Updating statistics...',
      duration: 1,
    });
  };

  // Chỉ hiển thị màn hình loading to nếu chưa có bất kỳ dữ liệu nào trong Context
  // if (loading && !stats) {
  //   return (
  //     <Flex justify="center" align="center" style={{ height: '80vh', flexDirection: 'column', gap: 10 }}>
  //       <Spin size="large" />
  //       <Text>Loading Dashboard Data...</Text>
  //     </Flex>
  //   );
  // }

  // Cấu hình Biểu đồ Cột (Content Distribution)
  const columnConfig = {
    data: [
      { type: 'Songs', value: stats?.counts?.totalSongs || 0 },
      { type: 'Albums', value: stats?.counts?.totalAlbums || 0 },
      { type: 'Artists', value: stats?.counts?.totalArtists || 0 },
      { type: 'Playlists', value: stats?.counts?.totalPlaylists || 0 },
    ],
    xField: 'type',
    yField: 'value',
    style: { fill: '#FE2851', radiusTopLeft: 4, radiusTopRight: 4 },
    label: {
      text: (d) => d.value,
      textBaseline: 'bottom',
      offset: 4,
    },
  };

  // Cấu hình Biểu đồ Đường (User Growth)
  const lineConfig = {
    data: stats?.userGrowth?.map(item => ({
      month: `Month ${item._id}`,
      count: item.count
    })) || [],
    xField: 'month',
    yField: 'count',
    colorField: '#1890ff',
    shapeField: 'smooth',
    point: { size: 5, shape: 'diamond' },
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Muzia Insights</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={onManualRefresh}
          loading={loading}
        >
          Refresh Data
        </Button>
      </Flex>

      {/* Hàng 1: Thống kê số lượng tổng quát */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title="Total Users" value={stats?.counts?.totalUsers} prefix={<UserOutlined />} styles={{ content: { color: '#3f51b5' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title="Total Songs" value={stats?.counts?.totalSongs} prefix={<CustomerServiceOutlined />} styles={{ content: { color: '#FE2851' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title="Total Albums" value={stats?.counts?.totalAlbums} prefix={<BuildOutlined />} styles={{ content: { color: '#4caf50' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title="Total Artists" value={stats?.counts?.totalArtists} prefix={<GlobalOutlined />} styles={{ content: { color: '#ff9800' } }} />
          </Card>
        </Col>
      </Row>

      {/* Hàng 2: Các biểu đồ phân tích */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Content Distribution" variant="borderless">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="User Registration Growth" variant="borderless">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      {/* Hàng 3: Top 5 Most Liked Songs */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>🔥 Top 5 Most Liked Songs</Title>}
            variant="borderless"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}
          >
            <Flex gap={16} justify="space-between" wrap="wrap">
              {stats?.topLikedSongs?.map((song, i) => (
                <Card
                  key={i}
                  hoverable
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: i === 0 ? '1px solid #FE2851' : '1px solid #f0f0f0',
                    background: i === 0 ? '#fff1f3' : '#fff'
                  }}
                  styles={{ body: { padding: '20px 10px' } }}
                >
                  {/* Huy hiệu thứ hạng */}
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: i === 0 ? '#FE2851' : '#52c41a',
                    color: '#fff',
                    padding: '2px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    RANK #{i + 1}
                  </div>

                  <Image
                    src={song.cover}
                    width={80}
                    height={80}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 15,
                      border: '3px solid #fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    preview={false}
                    fallback="https://via.placeholder.com/80?text=Muzia"
                  />

                  <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text strong ellipsis={{ tooltip: song.title }} style={{ fontSize: '14px', color: '#262626' }}>
                      {song.title}
                    </Text>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Badge
                      count={`${song.count.toLocaleString()} Likes`}
                      style={{
                        backgroundColor: i === 0 ? '#FE2851' : '#f5f5f5',
                        color: i === 0 ? '#fff' : '#8c8c8c',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                </Card>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;