import { useContext, useEffect, useState } from 'react';
import { 
  Table, Avatar, Space, Button, Tooltip, Typography, Badge,
  Popconfirm
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  UserOutlined, HeartOutlined, TeamOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateArtist from '../../../components/Artist/CreateArtist';
import { deleteArtists, getAllArtists } from '../../../services/artistService';

const { Text, Title } = Typography;

function ArtistManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  const { messageApi } = useContext(AppContext);

  // --- LẤY DATA THẬT TỪ BACKEND ---
  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await getAllArtists();
      if (response.success) {
        // Map dữ liệu và thêm key cho Ant Design Table
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

  const handleEdit = (record) => {
    setEditingArtist(record);
    setIsModalOpen(true);
  };

  // --- XÓA DATA THẬT ---
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteArtists(id);
      if (response.success) {
        messageApi.success(response.message || "Artist successfully removed!");
        fetchArtists(); // Load lại danh sách sau khi xóa
      } else {
        messageApi.error(response.message || "Erase failure!");
      }
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Error when deleting artist!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Artist',
      dataIndex: 'name',
      key: 'artist',
      fixed: 'left',
      render: (_, record) => (
        <Space>
          {/* Avatar ưu tiên lấy từ backend, nếu không có hiện icon mặc định */}
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
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {/* fix nb_fan dùng toLocaleString() để ngăn lỗi nếu data null */}
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
            description={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
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
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={artists} 
        bordered
        pagination={{ pageSize: 6 }}
        // Thêm scroll để table linh hoạt hơn trên màn hình nhỏ
        scroll={{ x: 800 }} 
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