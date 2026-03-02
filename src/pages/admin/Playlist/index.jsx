import { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image, Tag, Empty
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  CustomerServiceOutlined, 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreatePlaylist from '../../../components/Playlist/CreatePlaylist';
import { deletePlaylists, getAllPlaylists } from '../../../services/playlistService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

function PlaylistManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- STATE DÀNH CHO BỘ LỌC ---
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  const { messageApi } = useContext(AppContext);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await getAllPlaylists();
      if (response.success) {
        setPlaylists(response.data.map(pl => ({ ...pl, key: pl._id })));
      }
    } catch (error) {
      messageApi.error("Error loading playlist!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // --- LOGIC FILTER ĐA TRƯỜNG CHO PLAYLIST ---
  const filteredData = useMemo(() => {
    return playlists.filter(playlist => {
      const kw = filters.keyword.toLowerCase();
      // Tìm theo tiêu đề hoặc mô tả của playlist
      const matchKeyword = !kw || 
        playlist.title?.toLowerCase().includes(kw) ||
        playlist.description?.toLowerCase().includes(kw);

      // Lọc theo trạng thái (active/inactive)
      const matchStatus = !filters.status || playlist.status === filters.status;

      return matchKeyword && matchStatus;
    });
  }, [playlists, filters]);

  // --- KẾT HỢP PHÂN TRANG ---
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi thực hiện tìm kiếm
  };

  const handleEdit = (record) => {
    setEditingPlaylist(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deletePlaylists(id);
      if (response.success) {
        messageApi.success(response.message);
        fetchPlaylists();
      } else {
        messageApi.error(response.message || "Erase failure!");
      }
    } catch (error) {
      messageApi.error("Error when deleting playlist!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Playlist Details',
      key: 'playlist',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <Space align="start">
          <Image 
            src={record.avatar} 
            width={50} height={50}
            style={{ borderRadius: 4, objectFit: 'cover' }} 
            fallback="https://via.placeholder.com/50"
          />
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 220 }}>
            <Text strong>{record.title}</Text>
            <Text 
              type="secondary" 
              style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}
              ellipsis={{ rows: 2, tooltip: record.description }}
            >
              {record.description || 'No description'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'userId',
      key: 'owner',
      render: (userId) => (
        <Tag color={userId === 'system' ? 'blue' : 'green'}>
          {userId === 'system' ? 'SYSTEM' : 'USER'}
        </Tag>
      ),
    },
    {
      title: 'Songs',
      key: 'songs',
      sorter: (a, b) => (a.songs?.length || 0) - (b.songs?.length || 0),
      render: (_, record) => (
        <Space>
          <CustomerServiceOutlined />
          <Text>{record.songs?.length || 0} tracks</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status ? status.toUpperCase() : 'N/A'} 
        />
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
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Playlist?"
            description="The song data inside will not be deleted."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
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
        <Title level={3} style={{ margin: 0 }}>Playlist Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingPlaylist(null);
            setIsModalOpen(true);
          }}
        >
          Add New Playlist
        </Button>
      </div>

      {/* TÁI SỬ DỤNG FILTERBAR GERIC */}
      <FilterBar 
        onFilterChange={handleFilterChange} 
      />
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description="No playlists found." /> }}
        pagination={{ 
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length, 
          pageSizeOptions: ['6', '8', '10', '15', '20'], 
          showSizeChanger: true, 
          onShowSizeChange: (_, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          onChange: (page) => {
            setCurrentPage(page);
          }
        }}
      />

      <CreatePlaylist 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={fetchPlaylists}
        data={editingPlaylist}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPlaylist(null);
        }}
      />
    </div>
  );
}

export default PlaylistManagement;