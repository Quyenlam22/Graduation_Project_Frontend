import { Select, Modal, Form, Input, Upload, Row, Col, Avatar, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { SongContext } from '../../Context/SongContext';
import { createPlaylist, updatePlaylist } from '../../services/playlistService';
import { getAllUsers } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

function CreatePlaylist(props) {
  const { t } = useTranslation();
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);

  const { songs } = useContext(SongContext);
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resUsers = await getAllUsers();
        if (resUsers.success) setUsers(resUsers.data);
      } catch (error) {
        console.error("Error retrieving user list:", error);
      }
    };

    if (isModalOpen) {
      fetchUserData();
      if (data) {
        form.setFieldsValue({
          ...data,
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
      formData.append('songs', JSON.stringify(values.songs || []));

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      let response = isEdit
        ? await updatePlaylist(data._id, formData)
        : await createPlaylist(formData);

      if (response.success) {
        messageApi.success(t('common.operation_success'));
        handleCancel();
        onSuccess();
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
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
      title={isEdit ? t('playlist.edit_title') : t('playlist.create_title')}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      okText={isEdit ? t('common.update') : t('common.create')}
      cancelText={t('common.cancel') || "Cancel"}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label={t('playlist.form_title')} rules={[{ required: true, message: t('playlist.error_title') }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label={t('common.status')} initialValue="active">
              <Select>
                <Option value="active">{t('common.active')}</Option>
                <Option value="inactive">{t('common.inactive')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="userId" label={t('playlist.owner')} initialValue="system" rules={[{ required: true, message: t('playlist.error_owner') }]}>
          <Select showSearch placeholder={t('playlist.owner')} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>
            <Option value="system" label="System Default">
              <Space><SettingOutlined /><Text strong>{t('playlist.system_default')}</Text></Space>
            </Option>
            {users.map(user => (
              <Option key={user.uid} value={user.uid} label={user.displayName}>
                <Space><Avatar size="small" src={user.photoURL} icon={<UserOutlined />} /><Text>{user.displayName}</Text></Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="songs" label={t('playlist.form_songs')}>
          <Select mode="multiple" allowClear placeholder={t('playlist.placeholder_songs')} showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}>
            {songs.map(song => (
              <Option key={song._id} value={song._id} label={song.title}>
                <Space><Avatar shape="square" size="small" src={song.cover} /><Text>{song.title}</Text><Text type="secondary"> - {song.artistName}</Text></Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label={t('album.form_description')}><TextArea rows={3} /></Form.Item>
        <Form.Item label={t('playlist.form_cover')}>
          <Upload listType="picture-card" fileList={fileList} beforeUpload={() => false} onChange={({ fileList }) => setFileList(fileList)} maxCount={1}>
            {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>{t('common.loading')}</div></div>}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreatePlaylist;