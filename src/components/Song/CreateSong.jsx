import { Select, Modal, Form, Input, Upload, Button, Image, InputNumber, Row, Col, Avatar, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined, LinkOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { ArtistContext } from '../../Context/ArtistContext';
import { AlbumContext } from '../../Context/AlbumContext';
import { useTranslation } from 'react-i18next';

import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css';
import { createSong, updateSongs } from '../../services/songService';

const { Text } = Typography;

function CreateSong(props) {
  const { t } = useTranslation();
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const { artists } = useContext(ArtistContext);
  const { albums } = useContext(AlbumContext);
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  useEffect(() => {
    if (isModalOpen) {
      if (data) {
        form.setFieldsValue({
          ...data,
          artistId: data.artistId?._id || data.artistId, 
          albumId: data.albumId?._id || data.albumId,
        });
        if (data.cover) {
          setFileList([{ uid: '-1', name: 'cover.png', status: 'done', url: data.cover }]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [data, isModalOpen, form]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('status', values.status);
      formData.append('audio', values.audio);
      formData.append('lyrics', values.lyrics || '');
      formData.append('duration', values.duration || 0);
      formData.append('artistId', values.artistId);
      if (values.albumId) formData.append('albumId', values.albumId);

      const selectedArtist = artists.find(a => a._id === values.artistId);
      const selectedAlbum = albums.find(a => a._id === values.albumId);
      if (selectedArtist) formData.append('artistName', selectedArtist.name);
      if (selectedAlbum) formData.append('albumName', selectedAlbum.title);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('cover', fileList[0].originFileObj);
      }

      let response = isEdit 
        ? await updateSongs(data._id, formData) 
        : await createSong(formData);

      if (response && response.success) {
        messageApi.success(t('common.operation_success'));
        handleCancel();
        if (onSuccess) onSuccess(); 
      }
      else {
        messageApi.error(response.message);
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
    <>
      <Modal 
        title={isEdit ? t('song.edit_title') : t('song.create_title')} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel} 
        confirmLoading={loading} 
        width={800} 
        okText={isEdit ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel') || 'Cancel'}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
                <Form.Item name="title" label={t('song.form_name')} rules={[{ required: true, message: t('song.error_name') }]}>
                    <Input placeholder={t('song.placeholder_name')} />
                </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label={t('common.status')} initialValue="active">
                <Select>
                    <Select.Option value="active">{t('common.active')}</Select.Option>
                    <Select.Option value="inactive">{t('common.inactive')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="artistId" label={t('common.artist')} rules={[{ required: true, message: t('album.error_artist') }]}>
                <Select showSearch placeholder={t('album.placeholder_artist')} optionFilterProp="label">
                  {artists.map(artist => (
                    <Select.Option key={artist._id} value={artist._id} label={artist.name}>
                      <Space><Avatar size="small" src={artist.avatar} icon={<UserOutlined />} />{artist.name}</Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="albumId" label={t('menu.albums')}>
                <Select showSearch allowClear placeholder={t('album.placeholder_title')} optionFilterProp="label">
                  {albums.map(album => (
                    <Select.Option key={album._id} value={album._id} label={album.title}>
                      <Space><BookOutlined />{album.title}</Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="audio" label={t('song.form_audio')} rules={[{ required: true, message: t('song.error_audio') }]}><Input prefix={<LinkOutlined />} /></Form.Item>
          <Form.Item name="lyrics" label={t('song.form_lyrics')}>
            <ReactQuill theme="snow" modules={modules} style={{ height: '200px', marginBottom: '50px' }} />
          </Form.Item>
          <Form.Item label={t('album.form_cover')}>
            <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={handleChange} beforeUpload={() => false} maxCount={1}>
              {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>{t('common.loading')}</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={previewOpen} title="Preview" footer={null} onCancel={() => setPreviewOpen(false)}><img alt="preview" style={{ width: '100%' }} src={previewImage} /></Modal>
    </>
  );
}

export default CreateSong;