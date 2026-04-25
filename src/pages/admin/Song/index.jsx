import { useContext, useState, useMemo } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image, Empty 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  PlayCircleOutlined, CustomerServiceOutlined, HeartOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { SongContext } from '../../../Context/SongContext';
import { formatDate } from '../../../utils/formatTime';
import CreateSong from '../../../components/Song/CreateSong';
import { deleteSongs } from '../../../services/songService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';
import { AlbumContext } from '../../../Context/AlbumContext';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { useTranslation } from 'react-i18next';
import useTitle from '../../../hooks/useTitle';

const { Text, Title } = Typography;

function SongManagement() {
  const { t } = useTranslation();
  const { songs, loading, refreshSongs } = useContext(SongContext);
  const { refreshAlbums } = useContext(AlbumContext);
  const { refreshPlaylists } = useContext(PlaylistContext);
  const { messageApi } = useContext(AppContext);

  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  useTitle(t('song.management'));

  const filteredData = useMemo(() => {
    return songs.filter(song => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw || 
        song.title?.toLowerCase().includes(kw) ||
        song.artistName?.toLowerCase().includes(kw) ||
        song.albumName?.toLowerCase().includes(kw);

      const matchStatus = !filters.status || song.status === filters.status;
      return matchKeyword && matchStatus;
    });
  }, [songs, filters]);

  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setEditingSong(record);
    setIsModalOpen(true);
  };

  const onSuccess = () => {
    refreshSongs();
    refreshAlbums();
    refreshPlaylists();
  }

  const handleDelete = async (uid) => {
    try {
      const response = await deleteSongs(uid);
      if (response && response.success) {
        messageApi.success(t('common.operation_success'));
        onSuccess(); 
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const columns = [
    {
      title: t('song.details'),
      key: 'song',
      fixed: 'left',
      width: 250,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, record) => (
        <Space>
          <Image src={record.cover} width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover' }} fallback="https://via.placeholder.com/50" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}><CustomerServiceOutlined /> {record.artistName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('menu.albums'),
      dataIndex: 'albumName',
      key: 'album',
      responsive: ['md'],
      sorter: (a, b) => (a.albumName || "").localeCompare(b.albumName || ""),
      render: (text) => <Text type="secondary">{text || 'N/A'}</Text>
    },
    {
      title: t('album.stats'),
      key: 'stats',
      width: 150,
      sorter: (a, b) => (a.listen || 0) - (b.listen || 0),
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><PlayCircleOutlined /> {record.listen?.toLocaleString() || 0}</div>
          <div><HeartOutlined /> {record.like?.length || 0} {t('artist.likes')}</div>
        </div>
      ),
    },
    {
      title: t('song.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (val) => formatDuration(val)
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
            title={t('song.delete_confirm')} 
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
    <div className="song-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>{t('song.management')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSong(null); setIsModalOpen(true); }}>
          {t('song.add_new')}
        </Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />
      
      <Table 
        rowKey="_id"
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description={t('search.no_result_db')} /> }}
        pagination={{ 
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          showSizeChanger: true,
          locale: { items_per_page: t('common.items_per_page') }
        }}
      />

      <CreateSong 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={onSuccess} 
        data={editingSong} 
        onCancel={() => { setIsModalOpen(false); setEditingSong(null); }}
      />
    </div>
  );
}

export default SongManagement;