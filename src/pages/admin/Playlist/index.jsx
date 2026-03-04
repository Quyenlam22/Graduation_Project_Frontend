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
import { PlaylistContext } from '../../../Context/PlaylistContext'; // IMPORT PLAYLIST CONTEXT
import { formatDate } from '../../../utils/formatTime';
import CreatePlaylist from '../../../components/Playlist/CreatePlaylist';
import { deletePlaylists } from '../../../services/playlistService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

function PlaylistManagement() {
  const { playlists, loading, refreshPlaylists } = useContext(PlaylistContext);
  const { messageApi } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  // --- LOGIC FILTER ĐA TRƯỜNG ---
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
        messageApi.success(response.message);
        refreshPlaylists(); // GỌI REFRESH TỪ CONTEXT
      }
    } catch (error) {
      messageApi.error("Error when deleting playlist!");
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
          <Image src={record.avatar} width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover' }} fallback="https://via.placeholder.com/50" />
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 220 }}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }} ellipsis={{ rows: 2, tooltip: record.description }}>
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
        <Badge status={status === 'active' ? 'success' : 'error'} text={status ? status.toUpperCase() : 'N/A'} />
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
          <Popconfirm title="Delete Playlist?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPlaylist(null); setIsModalOpen(true); }}>
          Add New Playlist
        </Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />
      
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
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
        }}
      />

      <CreatePlaylist 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={refreshPlaylists} // TRUYỀN HÀM REFRESH
        data={editingPlaylist}
        onCancel={() => { setIsModalOpen(false); setEditingPlaylist(null); }}
      />
    </div>
  );
}

export default PlaylistManagement;