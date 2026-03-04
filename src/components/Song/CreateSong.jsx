import { Select, Modal, Form, Input, Upload, Button, Image, InputNumber, Row, Col, Avatar, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined, LinkOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { ArtistContext } from '../../Context/ArtistContext'; // IMPORT ARTIST CONTEXT
import { AlbumContext } from '../../Context/AlbumContext';   // IMPORT ALBUM CONTEXT

import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css';
import { createSong, updateSongs } from '../../services/songService';

const { Text } = Typography;

function CreateSong(props) {
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
        messageApi.success(response.message);
        handleCancel();
        if (onSuccess) onSuccess(); 
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
    <>
      <Modal title={isEdit ? "Edit Song" : "Add New Song"} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} confirmLoading={loading} width={800} okText={isEdit ? "Update" : "Create"}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}><Form.Item name="title" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select><Select.Option value="active">Active</Select.Option><Select.Option value="inactive">Inactive</Select.Option></Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="artistId" label="Artist" rules={[{ required: true }]}>
                <Select showSearch placeholder="Select Artist" optionFilterProp="label">
                  {/* SỬ DỤNG DỮ LIỆU TỪ CONTEXT */}
                  {artists.map(artist => (
                    <Select.Option key={artist._id} value={artist._id} label={artist.name}>
                      <Space><Avatar size="small" src={artist.avatar} icon={<UserOutlined />} />{artist.name}</Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="albumId" label="Album">
                <Select showSearch allowClear placeholder="Select Album" optionFilterProp="label">
                  {/* SỬ DỤNG DỮ LIỆU TỪ CONTEXT */}
                  {albums.map(album => (
                    <Select.Option key={album._id} value={album._id} label={album.title}>
                      <Space><BookOutlined />{album.title}</Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="audio" label="Link Audio" rules={[{ required: true }]}><Input prefix={<LinkOutlined />} /></Form.Item>
          <Form.Item name="lyrics" label="Lyric Song">
            <ReactQuill theme="snow" modules={modules} style={{ height: '200px', marginBottom: '50px' }} />
          </Form.Item>
          <Form.Item label="Cover">
            <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={handleChange} beforeUpload={() => false} maxCount={1}>
              {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={previewOpen} title="Preview" footer={null} onCancel={() => setPreviewOpen(false)}><img alt="preview" style={{ width: '100%' }} src={previewImage} /></Modal>
    </>
  );
}

export default CreateSong;