import { useContext, useState, useMemo } from 'react';
import { 
  Table, Tag, Avatar, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Empty
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, UserOutlined, 
  GoogleOutlined, LockOutlined, PlusOutlined 
} from '@ant-design/icons';
import avatarDefault from "../../../assets/images/avatar.jpg";
import CreateUser from '../../../components/User/CreateUser';
import { deleteUser } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';
import { UserContext } from '../../../Context/UserContext'; 
import { formatDate } from '../../../utils/formatTime';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

const userRoles = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' }
];

function UserManagement() {
  const { users, loading, refreshUsers } = useContext(UserContext);
  const { messageApi } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  // LOGIC FILTERING
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw || 
        user.displayName?.toLowerCase().includes(kw) ||
        user.email?.toLowerCase().includes(kw);

      const matchRole = !filters.status || user.role === filters.status;
      return matchKeyword && matchRole;
    });
  }, [users, filters]);

  // PAGINATION
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (uid) => {
    try {
      const response = await deleteUser(uid);
      if (response && response.success) {
        messageApi.success(response.message || "User deleted successfully");
        refreshUsers(); 
      }
    } catch (error) {
      messageApi.error("An error occurred while deleting the user.");
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'displayName',
      key: 'user',
      fixed: 'left',
      sorter: (a, b) => (a.displayName || "").localeCompare(b.displayName || ""),
      render: (text, record) => (
        <Space>
          <Avatar src={record.photoURL || avatarDefault} icon={<UserOutlined />} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{text || 'No Name'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.uid?.substring(0, 8)}...
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
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
        let color = role === 'admin' ? 'volcano' : 'blue';
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Badge status={state === 'online' ? 'success' : 'default'} text={state?.toUpperCase() || 'OFFLINE'} />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date, 'MM/DD/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete User"
            description={`Are you sure you want to delete ${record.displayName}?`}
            onConfirm={() => handleDelete(record.uid)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Add New Admin
        </Button>
      </div>

      <FilterBar 
        filterLabel="Role"
        options={userRoles} 
        onFilterChange={handleFilterChange}
      />
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description="No matching users found" /> }}
        pagination={{ 
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length, 
          showSizeChanger: true, 
          onShowSizeChange: (_, size) => { setPageSize(size); setCurrentPage(1); },
          onChange: (page) => setCurrentPage(page)
        }}
      />

      <CreateUser 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={refreshUsers} 
        data={editingUser} 
        onCancel={() => { setIsModalOpen(false); setEditingUser(null); }}
      />
    </div>
  );
}

export default UserManagement;