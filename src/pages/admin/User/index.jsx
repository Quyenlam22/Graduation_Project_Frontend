import { useContext, useState, useMemo, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import useTitle from '../../../hooks/useTitle';

const { Text, Title } = Typography;

function UserManagement() {
  const { t } = useTranslation();
  const { users, loading, refreshUsers } = useContext(UserContext);
  const { messageApi } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  useTitle(t('user.management'));

  const userRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && users.length === 0 && !loading) {
      refreshUsers();
    }
  }, [users.length, loading, refreshUsers]);

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
        messageApi.success(t('common.operation_success'));
        refreshUsers();
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
    }
  };

  const columns = [
    {
      title: t('user.display_name'),
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
      title: t('user.provider'),
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
      title: t('user.form_role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'admin' ? 'volcano' : 'blue';
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Badge
          status={state === 'online' ? 'success' : 'default'}
          text={state === 'online' ? t('user.state_online') : t('user.state_offline')}
        />
      ),
    },
    {
      title: t('common.created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date, 'DD/MM/YYYY'),
    },
    {
      title: t('common.action'),
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('common.edit')}>
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title={t('common.delete')}
            description={t('user.delete_confirm', { name: record.displayName })}
            onConfirm={() => handleDelete(record.uid)}
            okText={t('common.delete') || "Yes"}
            cancelText={t('common.cancel') || "No"}
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
        <Title level={3} style={{ margin: 0 }}>{t('user.management')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          {t('user.add_new_admin')}
        </Button>
      </div>

      <FilterBar
        filterLabel={t('user.form_role')}
        options={userRoles}
        onFilterChange={handleFilterChange}
      />

      <Table
        loading={loading}
        columns={columns}
        dataSource={currentDisplayData}
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description={t('search.no_results')} /> }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          locale: { items_per_page: t('common.items_per_page') },
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
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