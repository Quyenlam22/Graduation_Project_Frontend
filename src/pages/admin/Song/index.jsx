import { useContext, useEffect, useState } from 'react';
import { 
  Table, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Image
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  PlayCircleOutlined, CustomerServiceOutlined, HeartOutlined 
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import CreateSong from '../../../components/Song/CreateSong';
import { deleteSongs, getAllSongs } from '../../../services/songService';

const { Text, Title } = Typography;

function SongManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null); // State quản lý bài hát đang sửa
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { messageApi } = useContext(AppContext);

  // 1. Hàm đóng Modal và reset state
  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  // 2. Hàm mở Modal để thêm mới
  const handleAddNew = () => {
    setEditingSong(null);
    setIsModalOpen(true);
  };

  // 3. Hàm mở Modal để chỉnh sửa
  const handleEdit = (record) => {
    setEditingSong(record);
    setIsModalOpen(true);
  };

  // 4. Hàm định dạng thời lượng bài hát (mm:ss)
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 5. Hàm lấy danh sách bài hát (Mock data)
  const fetchSongs = async () => {
    try {
      const response = await getAllSongs();
      if (response.success) {
        const dataWithKey = response.data.map(song => ({
          ...song,
          key: song._id
        }));
        setSongs(dataWithKey);
      }
    } catch (error) {
      console.error("Error fetching songs: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDelete = async (uid) => {
    try {
      setLoading(true);
      const response = await deleteSongs(uid);
      
      if (response && response.success) {
        messageApi.success(response.message);
        fetchSongs();
      } else {
        messageApi.error(response.message || "Failed to delete song.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      messageApi.error(error.response?.data?.message || "An error occurred while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Song Details',
      dataIndex: 'title',
      key: 'song',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space>
          <Image 
            src={record.cover} 
            width={50} 
            style={{ borderRadius: 4, objectFit: 'cover' }} 
            fallback="https://via.placeholder.com/50"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CustomerServiceOutlined /> {record.artistName}
            </Text>
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
          <div><PlayCircleOutlined /> {record.listen.toLocaleString()}</div>
          <div><HeartOutlined /> {record.like.length} Likes</div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (_, record) => formatDuration(record.duration)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status.toUpperCase()} 
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
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Song?"
              description={`Are you sure you want to delete the song ${record.title}?`}
              onConfirm={() => handleDelete(record._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
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
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddNew}
        >
          Add New Song
        </Button>
      </div>
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={songs} 
        scroll={{ x: 1000 }} 
        pagination={{ pageSize: 6 }}
        bordered
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