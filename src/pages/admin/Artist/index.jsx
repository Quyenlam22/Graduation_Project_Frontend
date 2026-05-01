import { useContext, useState, useMemo } from 'react';
import {
  Table, Avatar, Space, Button, Tooltip, Typography, Badge,
  Popconfirm, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  UserOutlined, HeartOutlined, TeamOutlined
} from '@ant-design/icons';
import { AppContext } from '../../../Context/AppProvider';
import { ArtistContext } from '../../../Context/ArtistContext';
import { formatDate } from '../../../utils/formatTime';
import CreateArtist from '../../../components/Artist/CreateArtist';
import { deleteArtists } from '../../../services/artistService';
import { paginate } from '../../../utils/paginate';
import FilterBar from '../../../components/Search/FilterBar';
import { SongContext } from '../../../Context/SongContext';
import { AlbumContext } from '../../../Context/AlbumContext';
import { PlaylistContext } from '../../../Context/PlaylistContext';
import { useTranslation } from 'react-i18next';
import useTitle from '../../../hooks/useTitle';

const { Text, Title } = Typography;

function ArtistManagement() {
  const { artists, loading, refreshArtists } = useContext(ArtistContext);
  const { refreshSongs } = useContext(SongContext);
  const { refreshAlbums } = useContext(AlbumContext);
  const { refreshPlaylists } = useContext(PlaylistContext);
  const { messageApi } = useContext(AppContext);
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: '', status: undefined });

  const filteredData = useMemo(() => {
    return artists.filter(artist => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword = !kw || artist.name?.toLowerCase().includes(kw);
      const matchStatus = !filters.status || artist.status === filters.status;
      return matchKeyword && matchStatus;
    });
  }, [artists, filters]);

  useTitle(t('artist.management'));

  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setEditingArtist(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteArtists(id);
      if (response.success) {
        messageApi.success(t('common.operation_success'));
        refreshArtists();
        refreshAlbums();
        refreshSongs();
        refreshPlaylists();
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
    }
  };

  const onSuccess = () => {
    refreshArtists();
    refreshAlbums();
    refreshSongs();
    refreshPlaylists();
  }

  const columns = [
    {
      title: t('common.artist'),
      key: 'artist',
      fixed: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      title: t('artist.info_title'),
      key: 'stats',
      sorter: (a, b) => (a.nb_fan || 0) - (b.nb_fan || 0),
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><TeamOutlined /> {(record.nb_fan || 0).toLocaleString()} {t('artist.fans')}</div>
          <div><HeartOutlined /> {(record.like?.length || 0)} {t('artist.followers')}</div>
        </div>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status === 'active' ? t('common.active') : t('common.inactive')}
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
            title={t('artist.delete_confirm')}
            onConfirm={() => handleDelete(record._id)}
            okButtonProps={{ danger: true }}
            okText={t('common.delete') || "Yes"}
            cancelText={t('common.cancel') || "No"}
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
        <Title level={3} style={{ margin: 0 }}>{t('artist.management')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingArtist(null); setIsModalOpen(true); }}>
          {t('artist.add_new')}
        </Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <Table
        loading={loading}
        columns={columns}
        dataSource={currentDisplayData}
        bordered
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty description={t('library.empty_artists')} /> }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          showSizeChanger: true,
          locale: { items_per_page: t('common.items_per_page') }
        }}
      />

      <CreateArtist
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSuccess={onSuccess}
        data={editingArtist}
        onCancel={() => { setIsModalOpen(false); setEditingArtist(null); }}
      />
    </div>
  );
}

export default ArtistManagement;