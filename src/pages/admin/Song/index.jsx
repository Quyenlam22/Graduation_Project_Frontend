import { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image, Empty 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  PlayCircleOutlined, CustomerServiceOutlined, HeartOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateSong from '../../../components/Song/CreateSong';
import { deleteSongs, getAllSongs } from '../../../services/songService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

function SongManagement() {
  const [songs, setSongs] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  const { messageApi } = useContext(AppContext);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const response = await getAllSongs();
      if (response.success) {
        setSongs(response.data.map(song => ({ ...song, key: song._id })));
      }
    } catch (error) {
      console.error("Error fetching songs: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSongs(); }, []);

  // --- LOGIC SEARCH ĐA TRƯỜNG ---
  const filteredData = useMemo(() => {
    return songs.filter(song => {
      // Lọc theo từ khóa (Tên, Artist)
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw || 
        song.title?.toLowerCase().includes(kw) ||
        song.artistName?.toLowerCase().includes(kw)||
        song.albumName?.toLowerCase().includes(kw);
        // song.deezerId?.toString().includes(kw);

      // Lọc theo trạng thái
      const matchStatus = !filters.status || song.status === filters.status;

      return matchKeyword && matchStatus;
    });
  }, [songs, filters]);

  // --- KẾT HỢP PHÂN TRANG ---
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  const handleAddNew = () => {
    setEditingSong(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSong(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (uid) => {
    try {
      setLoading(true);
      const response = await deleteSongs(uid);
      if (response && response.success) {
        messageApi.success(response.message);
        fetchSongs();
      }
    } catch (error) {
      messageApi.error("An error occurred while deleting.");
    } finally {
      setLoading(false);
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
    // Sắp xếp theo bảng chữ cái của tiêu đề bài hát
    sorter: (a, b) => a.title.localeCompare(b.title),
    render: (_, record) => (
      <Space>
        <Image src={record.cover} width={50} style={{ borderRadius: 4, objectFit: 'cover' }} fallback="https://via.placeholder.com/50" />
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
    render: (text) => <Text type="secondary">{text || 'Single'}</Text>
  },
  {
    title: 'Stats',
    key: 'stats',
    width: 150,
    render: (_, record) => (
      <div style={{ fontSize: '12px' }}>
        {/* Lượt nghe */}
        <div><PlayCircleOutlined /> {record.listen?.toLocaleString() || 0}</div>
        {/* Lượt thích */}
        <div><HeartOutlined /> {record.like?.length || 0} Likes</div>
      </div>
    ),
    // Bạn có thể chọn 1 trong 2 tiêu chí để làm sorter chính cho cột Stats
    // Ví dụ: Sắp xếp theo lượt nghe
    sorter: (a, b) => (a.listen || 0) - (b.listen || 0),
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
    // Sắp xếp theo tổng số giây
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
    // Sắp xếp theo thời gian thực (Timestamp)
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
        <Tooltip title="Delete">
          <Popconfirm title="Delete Song?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  },
];
  return (
    <div className="song-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Song Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Add New Song</Button>
      </div>

      <FilterBar 
        onFilterChange={handleFilterChange} 
      />
      
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
          total: filteredData.length, // Quan trọng: total của mảng đã lọc
          pageSizeOptions: ['6', '8', '10', '15', '20'], 
          showSizeChanger: true, 
          onShowSizeChange: (_, size) => { setPageSize(size); setCurrentPage(1); },
          onChange: (page) => setCurrentPage(page)
        }}
      />

      <CreateSong 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={fetchSongs}
        data={editingSong} 
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default SongManagement;