import { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image, Empty 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, HeartOutlined, AudioOutlined, UserOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateAlbum from '../../../components/Album/CreateAlbum';
import { deleteAlbums, getAllAlbums } from '../../../services/albumService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

function AlbumManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- STATE DÀNH CHO BỘ LỌC ---
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  const { messageApi } = useContext(AppContext);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await getAllAlbums();
      if (response.success) {
        const dataWithKey = response.data.map(item => ({
          ...item,
          key: item._id
        }));
        setAlbums(dataWithKey);
      }
    } catch (error) {
      console.error("Fetch Albums Error:", error);
      messageApi.error("Unable to load album list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // --- LOGIC FILTER DÀNH CHO ALBUM ---
  const filteredData = useMemo(() => {
    return albums.filter(album => {
      const kw = filters.keyword.toLowerCase();
      // Khớp theo tiêu đề album, tên nghệ sĩ hoặc deezerId (nếu có)
      const matchKeyword = !kw || 
        album.title?.toLowerCase().includes(kw) ||
        album.artistName?.toLowerCase().includes(kw);

      const matchStatus = !filters.status || album.status === filters.status;

      return matchKeyword && matchStatus;
    });
  }, [albums, filters]);

  // --- PHÂN TRANG DỰA TRÊN DATA ĐÃ FILTER ---
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  };

  const handleEdit = (record) => {
    setEditingAlbum(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAlbums(id);
      if (response.success) {
        messageApi.success(response.message || "Album successfully deleted.");
        fetchAlbums();
      }
    } catch (error) {
      messageApi.error("Error when deleting album");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Album Details',
      key: 'album',
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Image 
            src={record.avatar} 
            width={50} 
            style={{ borderRadius: 4, objectFit: 'cover' }} 
            fallback="https://via.placeholder.com/50"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <UserOutlined /> {record.artistName || 'Unknown Artist'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      sorter: (a, b) => (a.nb_tracks || 0) - (b.nb_tracks || 0),
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><AudioOutlined /> {record.nb_tracks || 0} Tracks</div>
          <div><HeartOutlined /> {record.like?.length || 0} Likes</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
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
            title="Delete album?"
            onConfirm={() => handleDelete(record._id)}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="album-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Album Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingAlbum(null);
            setIsModalOpen(true);
          }}
        >
          Add New Album
        </Button>
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
        locale={{ emptyText: <Empty description="No albums found." /> }}
        pagination={{ 
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length, // Cập nhật dựa trên data đã lọc
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

      <CreateAlbum 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={fetchAlbums}
        data={editingAlbum}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingAlbum(null);
        }}
      />
    </div>
  );
}

export default AlbumManagement;