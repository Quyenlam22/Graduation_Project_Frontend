import { Select, Modal, Form, Input, Upload, Button, Image, InputNumber, Row, Col } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { IoMusicalNotesOutline } from "react-icons/io5";

// --- IMPORT REACT QUILL ---
import ReactQuill from 'react-quill-new'; 
// Giữ nguyên dòng CSS này (nó dùng chung định dạng của Quill):
import 'react-quill-new/dist/quill.snow.css';
import { createSong, updateSongs } from '../../services/songService';

function CreateSong(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  // Cấu hình các nút công cụ giống Word cho Editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'], // định dạng chữ
      [{ 'color': [] }, { 'background': [] }],          // màu chữ, màu nền
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']                                  // nút xóa định dạng
    ],
  };

  useEffect(() => {
    if (isModalOpen) {
      if (data) {
        form.setFieldsValue({
          ...data,
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

      // 1. Khởi tạo FormData để gửi cả Text và File
      const formData = new FormData();
      
      formData.append('title', values.title);
      formData.append('artistName', values.artistName || '');
      formData.append('albumName', values.albumName || '');
      formData.append('audio', values.audio);
      formData.append('lyrics', values.lyrics || '');
      formData.append('duration', values.duration || 0);
      formData.append('status', values.status);

      // 2. Kiểm tra và append file ảnh
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('cover', fileList[0].originFileObj);
      }

      let response;
      if (isEdit) {
        response = await updateSongs(data._id, formData); // Bạn sẽ viết hàm này sau
      } else {
        response = await createSong(formData); 
      }

      if (response && response.success) {
        messageApi.success(response.message);
        handleCancel();
        if (onSuccess) onSuccess();
      }
      else {
        messageApi.error(response.message);
      }
    } catch (error) {
      console.error("System error while creating song: ", error);
      messageApi.error(error.response?.data?.message || "Operation failed!");
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
        title={isEdit ? "Edit Song" : "Add New Song"} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        okText={isEdit ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Example: Lạc Trôi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="artistName" label="Artist">
                <Input prefix={<IoMusicalNotesOutline />} placeholder="Artist Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="albumName" label="Album">
                <Input placeholder="Album Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="audio" label="Link Audio (Stream)" rules={[{ required: true }]}>
            <Input prefix={<LinkOutlined />} placeholder="https://link-audio-stream.mp3" />
          </Form.Item>

          {/* SỬ DỤNG REACT QUILL CHO LYRICS */}
          <Form.Item name="lyrics" label="Lyric Song">
            <ReactQuill 
              theme="snow" 
              modules={modules}
              placeholder="Enter lyrics and formatting here..."
              style={{ height: '200px', marginBottom: '50px' }} 
            />
          </Form.Item>

          <Form.Item label="Cover">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={previewOpen} title="Preview" footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
}

export default CreateSong;