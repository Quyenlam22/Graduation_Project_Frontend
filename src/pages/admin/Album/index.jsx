import { useContext, useState, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  Tooltip,
  Typography,
  Badge,
  Popconfirm,
  Image,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HeartOutlined,
  AudioOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../../Context/AppProvider";
import { AlbumContext } from "../../../Context/AlbumContext";
import { formatDate } from "../../../utils/formatTime";
import CreateAlbum from "../../../components/Album/CreateAlbum";
import { deleteAlbums } from "../../../services/albumService";
import { paginate } from "../../../utils/paginate";
import FilterBar from "../../../components/Search/FilterBar";
import { SongContext } from "../../../Context/SongContext";
import { useTranslation } from "react-i18next";
import useTitle from "../../../hooks/useTitle";

const { Text, Title } = Typography;

function AlbumManagement() {
  const { albums, loading, refreshAlbums } = useContext(AlbumContext);
  const { refreshSongs } = useContext(SongContext);
  const { messageApi } = useContext(AppContext);
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ keyword: "", status: undefined });

  useTitle(t("album.management"));

  const filteredData = useMemo(() => {
    return albums.filter((album) => {
      const kw = filters.keyword.toLowerCase();
      const matchKeyword =
        !kw ||
        album.title?.toLowerCase().includes(kw) ||
        album.artistName?.toLowerCase().includes(kw);
      const matchStatus = !filters.status || album.status === filters.status;
      return matchKeyword && matchStatus;
    });
  }, [albums, filters]);

  const paginationData = paginate(filteredData, currentPage, pageSize);
  const currentDisplayData = paginationData.currentItems;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleEdit = (record) => {
    setEditingAlbum(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteAlbums(id);
      if (response.success) {
        messageApi.success(t("common.operation_success"));
        refreshAlbums();
        refreshSongs();
      }
    } catch (error) {
      messageApi.error(t("common.operation_failed"));
    }
  };

  const onSuccess = () => {
    refreshAlbums();
    refreshSongs();
  };

  const columns = [
    {
      title: t("album.details"),
      key: "album",
      fixed: "left",
      render: (_, record) => (
        <Space>
          <Image
            src={record.avatar}
            width={50}
            height={50}
            style={{ borderRadius: 4, objectFit: "cover" }}
            fallback="https://via.placeholder.com/50"
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <UserOutlined /> {record.artistName || t("common.loading")}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t("album.stats"),
      key: "stats",
      sorter: (a, b) => (a.nb_tracks || 0) - (b.nb_tracks || 0),
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div>
            <AudioOutlined /> {record.nb_tracks || 0} {t("album.tracks")}
          </div>
          <div>
            <HeartOutlined /> {record.like?.length || 0} {t("artist.likes")}
          </div>
        </div>
      ),
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "error"}
          text={status === "active" ? t("common.active") : t("common.inactive")}
        />
      ),
    },
    {
      title: t("common.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["lg"],
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date, "DD/MM/YYYY"),
    },
    {
      title: t("common.action"),
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("common.edit")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t("album.delete_confirm")}
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
    <div className="album-management">
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {t("album.management")}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingAlbum(null);
            setIsModalOpen(true);
          }}
        >
          {t("album.add_new")}
        </Button>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <Table
        loading={loading}
        columns={columns}
        dataSource={currentDisplayData}
        bordered
        scroll={{ x: 1000 }}
        locale={{
          emptyText: <Empty description={t("library.empty_albums")} />,
        }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          locale: {
            items_per_page: t("common.items_per_page"),
          },
          // pageSizeOptions: ["6", "8", "10", "20", "50"],
        }}
      />

      <CreateAlbum
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSuccess={onSuccess}
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
