import { Select, Modal, Form, Input, Upload, Row, Col, Avatar, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined, UserOutlined, SettingOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { createPlaylist, updatePlaylist } from '../../services/playlistService';
import { getAllUsers } from '../../services/authService';
import { getAllSongs } from '../../services/songService'; // Import thêm service lấy bài hát

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

function CreatePlaylist(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]); // State lưu danh sách bài hát

  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi đồng thời cả User và Song để tối ưu performance
        const [resUsers, resSongs] = await Promise.all([
          getAllUsers(),
          getAllSongs()
        ]);
        
        if (resUsers.success) setUsers(resUsers.data);
        if (resSongs.success) setSongs(resSongs.data);
      } catch (error) {
        console.error("Error retrieving data list:", error);
      }
    };

    if (isModalOpen) {
      fetchData();
      if (data) {
        form.setFieldsValue({
          ...data,
          // Đảm bảo mảng songs chỉ chứa ID nếu backend trả về object
          songs: data.songs?.map(s => s._id || s) 
        });
        if (data.avatar) {
          setFileList([{ uid: '-1', name: 'playlist.png', status: 'done', url: data.avatar }]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [data, isModalOpen, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('userId', values.userId);
      formData.append('status', values.status);
      formData.append('description', values.description || '');
      
      // Chuyển mảng songs thành chuỗi JSON để gửi qua FormData
      formData.append('songs', JSON.stringify(values.songs || []));

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      let response = isEdit 
        ? await updatePlaylist(data._id, formData) 
        : await createPlaylist(formData);

      if (response.success) {
        messageApi.success(response.message);
        handleCancel();
        onSuccess();
      } else {
        messageApi.error(response.message);
      }
    } catch (error) {
       messageApi.error("Operation failed!");
    } finally {
       setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
    if (onCancel) onCancel();
  };

  return (
    <Modal 
      title={isEdit ? "Edit Playlist" : "Create New Playlist"} 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700} // Tăng width để chứa thêm nội dung
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label="Playlist Title" rules={[{ required: true }]}>
              <Input placeholder="Example: Vietnamese Pop 2026" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status" initialValue="active">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="userId" label="Owner" initialValue="system" rules={[{ required: true }]}>
          <Select 
            showSearch
            placeholder="Choose the playlist owner:"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          >
            <Option value="system" label="System Default">
              <Space><SettingOutlined style={{ color: '#1890ff' }} /><Text strong>(System Default)</Text></Space>
            </Option>
            {users.map(user => (
              <Option key={user.uid} value={user.uid} label={user.displayName}>
                <Space>
                  <Avatar size="small" src={user.photoURL} icon={<UserOutlined />} />
                  <Text>{user.displayName}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>({user.email})</Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* THÊM PHẦN LỰA CHỌN BÀI HÁT TẠI ĐÂY */}
        <Form.Item name="songs" label="Songs Selection">
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Search and add songs to playlist..."
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          >
            {songs.map(song => (
              <Option key={song._id} value={song._id} label={song.title}>
                <Space>
                  <Avatar shape="square" size="small" src={song.cover} icon={<CustomerServiceOutlined />} />
                  <Text>{song.title}</Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}> - {song.artistName}</Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Description of playlist content..." />
        </Form.Item>

        <Form.Item label="Playlist Cover">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : (
              <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreatePlaylist;