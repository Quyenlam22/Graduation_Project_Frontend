import { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Table, Avatar, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Empty
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  UserOutlined, HeartOutlined, TeamOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateArtist from '../../../components/Artist/CreateArtist';
import { deleteArtists, getAllArtists } from '../../../services/artistService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

function ArtistManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE CHO BỘ LỌC ---
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  const { messageApi } = useContext(AppContext);

  // --- LẤY DATA TỪ BACKEND ---
  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await getAllArtists();
      if (response.success) {
        const dataWithKey = response.data.map(item => ({
          ...item,
          key: item._id
        }));
        setArtists(dataWithKey);
      }
    } catch (error) {
      console.error("Fetch Artists Error:", error);
      messageApi.error("Unable to load artist list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // --- LOGIC FILTER NGHỆ SĨ ---
  const filteredData = useMemo(() => {
    return artists.filter(artist => {
      const kw = filters.keyword.toLowerCase();
      // Tìm theo tên nghệ sĩ
      const matchKeyword = !kw || 
        artist.name?.toLowerCase().includes(kw);

      const matchStatus = !filters.status || artist.status === filters.status;

      return matchKeyword && matchStatus;
    });
  }, [artists, filters]);

  // --- PHÂN TRANG DỰA TRÊN DATA ĐÃ LỌC ---
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleEdit = (record) => {
    setEditingArtist(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteArtists(id);
      if (response.success) {
        messageApi.success(response.message || "Artist successfully removed!");
        fetchArtists();
      }
    } catch (error) {
      messageApi.error("Error when deleting artist!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Artist',
      key: 'artist',
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size={50} icon={<UserOutlined />} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
                Deezer ID: {record.deezerId || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Fans & Likes',
      key: 'stats',
      // Sắp xếp dựa trên số lượng Fan (nb_fan)
      sorter: (a, b) => (a.nb_fan || 0) - (b.nb_fan || 0),
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><TeamOutlined /> {(record.nb_fan || 0).toLocaleString()} Fans</div>
          <div><HeartOutlined /> {(record.like?.length || 0)} Followers</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status ? status.toUpperCase() : 'INACTIVE'} 
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
            title="Remove the artist?"
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
    <div className="artist-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Artist Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingArtist(null);
            setIsModalOpen(true);
          }}
        >
          Add New Artist
        </Button>
      </div>

      {/* TÁI SỬ DỤNG FILTERBAR */}
      <FilterBar 
        onFilterChange={handleFilterChange} 
      />
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description="No artists found." /> }}
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

      <CreateArtist 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={fetchArtists}
        data={editingArtist}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingArtist(null);
        }}
      />
    </div>
  );
}

export default ArtistManagement;