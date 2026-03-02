import { useContext, useEffect, useState, useMemo } from 'react';
import { 
  Table, Tag, Avatar, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Empty
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, UserOutlined, 
  GoogleOutlined, LockOutlined, PlusOutlined 
} from '@ant-design/icons';
import avatar from "../../../assets/images/avatar.jpg";
import CreateUser from '../../../components/User/CreateUser';
import { deleteUser, getAllUsers } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';
import { formatDate } from '../../../utils/formatTime';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';

const { Text, Title } = Typography;

const userRoles = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' }
];

function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE DÀNH CHO BỘ LỌC ---
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  const { messageApi } = useContext(AppContext);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response.success) {
        const dataWithKey = response.data.map(user => ({
          ...user,
          key: user._id
        }));
        setUsers(dataWithKey);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
      messageApi.error("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LOGIC SEARCH ĐA TRƯỜNG CHO USER ---
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw || 
        user.displayName?.toLowerCase().includes(kw) ||
        user.email?.toLowerCase().includes(kw);

      // Lọc theo Role (giá trị 'status' từ FilterBar trả về)
      const matchRole = !filters.status || user.role === filters.status;

      return matchKeyword && matchRole;
    });
  }, [users, filters]);

  // --- KẾT HỢP PHÂN TRANG ---
  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (uid) => {
    try {
      setLoading(true);
      const response = await deleteUser(uid);
      if (response && response.success) {
        messageApi.success(response.message);
        fetchUsers();
      } else {
        messageApi.error(response.message || "Xóa người dùng thất bại.");
      }
    } catch (error) {
      messageApi.error("Có lỗi xảy ra khi xóa.");
    } finally {
      setLoading(false);
    }
  };

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
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.uid?.substring(0, 8)}...</Text>
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
            {role?.toUpperCase()}
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
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete the user"
              description={`Are you sure to delete ${record.displayName}?`}
              onConfirm={() => handleDelete(record.uid)}
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
    <div className="user-management">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Add New Admin
        </Button>
      </div>

      {/* SỬ DỤNG FILTERBAR DÙNG CHUNG */}
      <FilterBar 
        filterLabel="Role"
        options={userRoles} // Truyền roles vào đây
        onFilterChange={(val) => {
          setFilters(val);
          setCurrentPage(1);
        }}
      />
      
      <Table 
        loading={loading}
        columns={columns} 
        dataSource={currentDisplayData} 
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description="Không tìm thấy người dùng phù hợp" /> }}
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

      <CreateUser 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen}
        onSuccess={fetchUsers}
        data={editingUser} 
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default UserManagement;