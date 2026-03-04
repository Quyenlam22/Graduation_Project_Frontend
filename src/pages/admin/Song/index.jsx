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
import { SongContext } from '../../../Context/SongContext'; // IMPORT SONG CONTEXT
import { formatDate } from '../../../utils/formatTime';
import CreateSong from '../../../components/Song/CreateSong';
import { deleteSongs } from '../../../services/songService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';
import { AlbumContext } from '../../../Context/AlbumContext';

const { Text, Title } = Typography;

function SongManagement() {
  const { songs, loading, refreshSongs } = useContext(SongContext);
  const { refreshAlbums } = useContext(AlbumContext);
  const { messageApi } = useContext(AppContext);

  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  // --- LOGIC FILTER ---
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
  }

  const handleDelete = async (uid) => {
    try {
      const response = await deleteSongs(uid);
      if (response && response.success) {
        messageApi.success(response.message);
        onSuccess(); 
      }
    } catch (error) {
      messageApi.error("An error occurred while deleting.");
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
      title: 'Song Details',
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
      title: 'Album',
      dataIndex: 'albumName',
      key: 'album',
      responsive: ['md'],
      sorter: (a, b) => (a.albumName || "").localeCompare(b.albumName || ""),
      render: (text) => <Text type="secondary">{text || 'Single'}</Text>
    },
    {
      title: 'Stats',
      key: 'stats',
      width: 150,
      sorter: (a, b) => (a.listen || 0) - (b.listen || 0),
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><PlayCircleOutlined /> {record.listen?.toLocaleString() || 0}</div>
          <div><HeartOutlined /> {record.like?.length || 0} Likes</div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (val) => formatDuration(val)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'error'} text={status?.toUpperCase()} />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date, 'DD/MM/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
          <Popconfirm title="Delete Song?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="song-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Song Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSong(null); setIsModalOpen(true); }}>Add New Song</Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description="No songs found." /> }}
        pagination={{ 
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
        }}
      />

      <CreateSong 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={onSuccess} // TRUYỀN HÀM REFRESH TỪ CONTEXT
        data={editingSong} 
        onCancel={() => { setIsModalOpen(false); setEditingSong(null); }}
      />
    </div>
  );
}

export default SongManagement;