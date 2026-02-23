import { useContext, useEffect, useState } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, HeartOutlined, AudioOutlined, UserOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateAlbum from '../../../components/Album/CreateAlbum';
// --- IMPORT SERVICE THẬT ---
import { deleteAlbums, getAllAlbums } from '../../../services/albumService';

const { Text, Title } = Typography;

function AlbumManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6); // Mặc định là 6 như ảnh của bạn

  const { messageApi } = useContext(AppContext);

  // --- LẤY DATA THẬT TỪ BACKEND ---
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await getAllAlbums();
      if (response.success) {
        // Thêm key cho Ant Design Table từ _id của MongoDB
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

  const handleEdit = (record) => {
    setEditingAlbum(record);
    setIsModalOpen(true);
  };

  // --- XÓA DATA THẬT ---
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAlbums(id);
      if (response.success) {
        messageApi.success(response.message || "Album successfully deleted.");
        fetchAlbums(); // Load lại danh sách mới nhất
      } else {
        messageApi.error(response.message || "Erase failure");
      }
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Error when deleting album");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Album Details',
      dataIndex: 'title',
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
            description={`Are you sure you want to delete the album ${record.title}?`}
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
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={albums} 
        bordered
        scroll={{ x: 900 }}
        pagination={{ 
          current: 1, // Trang hiện tại
          pageSize: pageSize, // Số dòng trên mỗi trang
          pageSizeOptions: ['6', '8', '10', '15', '20'], // Các lựa chọn cho người dùng
          showSizeChanger: true, // Hiển thị cái dropdown "6 / page"
          onShowSizeChange: (current, size) => {
            setPageSize(size); // Cập nhật lại state khi người dùng chọn số khác
          },
          onChange: (page) => {
            console.log("Switch to page: ", page);
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