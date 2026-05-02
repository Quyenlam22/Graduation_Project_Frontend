import { useContext, useState, useMemo } from 'react';
import {
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image, Tag, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { formatDate } from '../../../utils/formatTime';
import CreatePlaylist from '../../../components/Playlist/CreatePlaylist';
import { deletePlaylists } from '../../../services/playlistService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';
import { useTranslation } from 'react-i18next';
import useTitle from '../../../hooks/useTitle';

const { Text, Title, Paragraph } = Typography;

function PlaylistManagement() {
  const { t } = useTranslation();
  const { playlists, loading, refreshPlaylists } = useContext(PlaylistContext);
  const { messageApi } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  useTitle(t('playlist.management'));

  const filteredData = useMemo(() => {
    return playlists.filter(playlist => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw ||
        playlist.title?.toLowerCase().includes(kw) ||
        playlist.description?.toLowerCase().includes(kw);
      const matchStatus = !filters.status || playlist.status === filters.status;
      return matchKeyword && matchStatus;
    });
  }, [playlists, filters]);

  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setEditingPlaylist(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deletePlaylists(id);
      if (response.success) {
        messageApi.success(t('common.delete_success', { title: "playlist" }));
        refreshPlaylists();
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
    }
  };

  const columns = [
    {
      title: t('playlist.details'),
      key: 'playlist',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <Space align="start">
          <Image src={record.avatar} width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover' }} fallback="https://via.placeholder.com/50" />
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 220 }}>
            <Text strong>{record.title}</Text>
            <Paragraph type="secondary" style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }} ellipsis={{ rows: 2, tooltip: record.description }}>
              {record.description || t('playlist.no_description')}
            </Paragraph>
          </div>
        </Space>
      ),
    },
    {
      title: t('playlist.owner'),
      dataIndex: 'userId',
      key: 'owner',
      render: (userId) => (
        <Tag color={userId === 'system' ? 'blue' : 'green'}>
          {userId === 'system' ? t('playlist.system') : t('playlist.user')}
        </Tag>
      ),
    },
    {
      title: t('common.songs_list'),
      key: 'songs',
      sorter: (a, b) => (a.songs?.length || 0) - (b.songs?.length || 0),
      render: (_, record) => (
        <Space>
          <CustomerServiceOutlined />
          <Text>{record.songs?.length || 0} {t('common.songs')}</Text>
        </Space>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'error'} text={status === 'active' ? t('common.active') : t('common.inactive')} />
      ),
    },
    {
      title: t('common.created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date, 'DD/MM/YYYY'),
    },
    {
      title: t('common.action'),
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
          <Popconfirm
            title={t('playlist.delete_confirm')}
            onConfirm={() => handleDelete(record._id)}
            okButtonProps={{ danger: true }}
            okText={t('common.delete') || "Yes"}
            cancelText={t('common.cancel') || "No"}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="playlist-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>{t('playlist.management')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPlaylist(null); setIsModalOpen(true); }}>
          {t('playlist.add_new')}
        </Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <Table
        loading={loading}
        columns={columns}
        dataSource={currentDisplayData}
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description={t('library.empty_playlists')} /> }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          showSizeChanger: true,
          locale: { items_per_page: t('common.items_per_page') }
        }}
      />

      <CreatePlaylist
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSuccess={refreshPlaylists}
        data={editingPlaylist}
        onCancel={() => { setIsModalOpen(false); setEditingPlaylist(null); }}
      />
    </div>
  );
}

export default PlaylistManagement;