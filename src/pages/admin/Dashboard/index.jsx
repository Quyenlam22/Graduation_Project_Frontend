import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../Context/DashboardContext";
import { Button, Flex, Typography, Row, Col, Card, Spin, Statistic, Image, Badge } from "antd";
import {
  UserOutlined, CustomerServiceOutlined,
  BuildOutlined, GlobalOutlined, ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";
import { Column, Line } from "@ant-design/plots";
import useTitle from '../../../hooks/useTitle';
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

function Dashboard() {
  const { t } = useTranslation();
  const { stats, loading, refreshStats, isFetched } = useContext(DashboardContext);
  const navigate = useNavigate();
  const { messageApi } = useContext(AppContext);

  useTitle("Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isFetched && !loading) {
      refreshStats();
    }
  }, [isFetched, loading, refreshStats]);

  const onManualRefresh = () => {
    refreshStats(true);
    messageApi.open({
      type: 'loading',
      content: t('admin.updating'),
      duration: 1,
    });
  };

  const columnConfig = {
    data: [
      { type: t('sidebar.songs'), value: stats?.counts?.totalSongs || 0 },
      { type: t('sidebar.albums'), value: stats?.counts?.totalAlbums || 0 },
      { type: t('sidebar.artists'), value: stats?.counts?.totalArtists || 0 },
      { type: t('sidebar.playlists'), value: stats?.counts?.totalPlaylists || 0 },
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

  const lineConfig = {
    data: stats?.userGrowth?.map(item => ({
      month: `${t('admin.month')} ${item._id}`,
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
        <Title level={2} style={{ margin: 0 }}>{t('admin.dashboard_title')}</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={onManualRefresh}
          loading={loading}
        >
          {t('admin.refresh_data')}
        </Button>
      </Flex>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title={t('admin.total_users')} value={stats?.counts?.totalUsers} prefix={<UserOutlined />} styles={{ content: { color: '#3f51b5' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title={t('admin.total_songs')} value={stats?.counts?.totalSongs} prefix={<CustomerServiceOutlined />} styles={{ content: { color: '#FE2851' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title={t('admin.total_albums')} value={stats?.counts?.totalAlbums} prefix={<BuildOutlined />} styles={{ content: { color: '#4caf50' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" hoverable>
            <Statistic title={t('admin.total_artists')} value={stats?.counts?.totalArtists} prefix={<GlobalOutlined />} styles={{ content: { color: '#ff9800' } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={t('admin.content_dist')} variant="borderless">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('admin.user_growth')} variant="borderless">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={<Title level={4} style={{ margin: 0 }}>🔥 {t('admin.top_liked')}</Title>}
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
                    {t('admin.rank')} #{i + 1}
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
                      count={`${song.count.toLocaleString()} ${t('artist.likes')}`}
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