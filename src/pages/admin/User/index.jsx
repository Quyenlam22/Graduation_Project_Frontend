import { useEffect, useState } from 'react'; // Sử dụng useState để quản lý ẩn hiện Modal
import { 
  Table, Tag, Avatar, Space, Button, Tooltip, Typography, Badge
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, UserOutlined, 
  GoogleOutlined, LockOutlined, PlusOutlined 
} from '@ant-design/icons';
import avatar from "../../../assets/images/avatar.jpg";
import moment from 'moment';
import CreateUser from '../../../components/User/CreateUser';
import { getAllUsers } from '../../../services/authService';

const { Text, Title } = Typography;

function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false); // Quản lý trạng thái Modal
  // const [form] = Form.useForm(); // Quản lý dữ liệu từ Form

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(); // Gọi API /all-users
      if (response.success) {
        // Map dữ liệu từ API vào dataSource của Table (thêm key cho Ant Design)
        const dataWithKey = response.data.map(user => ({
          ...user,
          key: user._id
        }));
        setUsers(dataWithKey);
      }
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'User',
      dataIndex: 'displayName',
      key: 'user',
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <Avatar src={record.photoURL ? record.photoURL : avatar} icon={<UserOutlined />} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{text || 'No Name'}</Text>
            <Tooltip title={record.uid}>
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.uid.substring(0, 8)}...</Text>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      width: 150,
      render: (provider) => (
        <Tag icon={provider === 'google' ? <GoogleOutlined /> : <LockOutlined />} color="default">
          {provider === 'google' ? 'Google' : 'Password'}
        </Tag>
      ),
    },
    {
      title: 'Permission',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'admin' ? 'volcano' : role === 'mod' ? 'purple' : 'blue';
        return (
          <Tag color={color} key={role}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Badge status={state === 'online' ? 'success' : 'default'} text={state} />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit User">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)} // Mở Modal
        >
          Add New Admin
        </Button>
        <CreateUser 
          isModalOpen={isModalOpen} 
          setIsModalOpen={setIsModalOpen}
          onSuccess={fetchUsers}
        />
      </div>
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={users} 
        scroll={{ x: 800 }} 
        pagination={{ pageSize: 6 }}
        bordered
      />
    </div>
  );
}

export default UserManagement;