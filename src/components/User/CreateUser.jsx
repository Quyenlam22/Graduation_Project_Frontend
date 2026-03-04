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
            name: 'avatar.png',
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

      if (isEdit && fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('photoURL', fileList[0].originFileObj);
      }

      let response = isEdit ? await updateUser(data.uid, formData) : await createAdmin(values);

      if (response && response.success) {
        messageApi.success(response.message || "Operation successful");
        handleClose();
        if (onSuccess) onSuccess(); 
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Operation failed!";
      messageApi.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
    if (onCancel) onCancel();
  };

  return (
    <>
      <Modal 
        title={isEdit ? "Edit User Information" : "Create New Admin"} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleClose}
        confirmLoading={loading}
        okText={isEdit ? "Update" : "Create"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="displayName" 
            label="Full Name" 
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email Address" 
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input disabled={isEdit} placeholder="johndoe@example.com" />
          </Form.Item>

          {!isEdit && (
            <Form.Item 
              name="password" 
              label="Password" 
              rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>
          )}

          {isEdit && (
            <Form.Item label="Profile Picture">
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
          )}

          <Form.Item name="role" label="Permission Role" initialValue="admin">
            <Select>
              <Select.Option value="admin">ADMIN</Select.Option>
              {isEdit && <Select.Option value="user">USER</Select.Option>}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

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