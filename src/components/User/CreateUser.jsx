import { Select, Modal, Form, Input, Upload, Button, Image } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { createAdmin, updateUser } from '../../services/authService';
import { AppContext } from '../../Context/AppProvider';

function CreateUser(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  useEffect(() => {
    if (isModalOpen) {
      if (data) {
        form.setFieldsValue({
          displayName: data.displayName,
          email: data.email,
          role: data.role,
        });
        if (data.photoURL) {
          setFileList([{
            uid: '-1',
            name: 'current_avatar.png',
            status: 'done',
            url: data.photoURL,
          }]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [data, isModalOpen, form]);

  // Hàm xử lý Preview ảnh
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
      formData.append('displayName', values.displayName);
      formData.append('role', values.role);
      
      if (!isEdit) {
        formData.append('email', values.email);
        formData.append('password', values.password);
      }

      // Chỉ append photoURL nếu là Edit và có file mới (originFileObj tồn tại)
      if (isEdit && fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('photoURL', fileList[0].originFileObj);
      }

      let response;
      if (isEdit) {
        response = await updateUser(data.uid, formData);
      } else {
        response = await createAdmin(values); // Create thường gửi JSON
      }

      if (response && response.success) {
        messageApi.success(response.message);
        handleCancel();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
       messageApi.error(error.response?.data?.message || "Operation failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal 
        title={isEdit ? "Edit User Information" : "Add New Admin"} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={onCancel}
        confirmLoading={loading}
        okText={isEdit ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="displayName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input disabled={isEdit} />
          </Form.Item>

          {!isEdit && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}

          {/* CHỈ HIỂN THỊ UPLOAD KHI LÀ EDIT */}
          {isEdit && (
            <Form.Item label="Profile Picture (Preview available)">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={() => false} // Chặn upload tự động
                maxCount={1}
              >
                {fileList.length >= 1 ? null : (
                  <button style={{ border: 0, background: 'none', color: 'inherit' }} type="button">
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                )}
              </Upload>
            </Form.Item>
          )}

          <Form.Item name="role" label="Role" initialValue="admin">
            <Select>
              <Select.Option value="admin">ADMIN</Select.Option>
              {isEdit && <Select.Option value="user">USER</Select.Option>}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal để xem ảnh to khi click vào preview */}
      <Modal 
        open={previewOpen} 
        title="Image Preview" 
        footer={null} 
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
}

export default CreateUser;