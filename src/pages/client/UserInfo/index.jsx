import { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, Card, Divider, message, Avatar, Upload } from 'antd';
import { UserOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';
import { updatePassword } from "firebase/auth";
import './UserInfo.scss';
import { auth } from '../../../firebase/config';
import { updateProfile } from '../../../services/authService';
import { AuthContext } from '../../../Context/AuthProvider';
import { updateProfile as updateFirebaseProfile } from "firebase/auth";

const UserInfo = () => {
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext); // Lấy setUser để cập nhật lại state toàn cục

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  useEffect(() => {
    if (user) {
      formInfo.setFieldsValue(user);
    }
  }, [user, formInfo]);

  // Cập nhật preview khi user chọn ảnh mới
  const handleUpload = (file) => {
    setAvatarFile(file); // Lưu file để gửi đi
    setPreviewUrl(URL.createObjectURL(file)); // Tạo link ảnh tạm thời để hiển thị lên giao diện
    return false; // Chặn upload tự động của Ant Design
  };
  
  const onUpdateInfo = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("displayName", values.displayName);

      if (avatarFile) {
        // Đổi key từ "avatar" thành "photoURL" theo ý bạn
        formData.append("photoURL", avatarFile); 
      }

      const response = await updateProfile(formData);

      if (response && response.status === 'success') {
        const updatedUserData = response.data;
        const newPhotoURL = response.data?.photoURL;

        if (auth.currentUser) {
          const updatePayload = { displayName: values.displayName };
          
          if (typeof newPhotoURL === 'string') {
            updatePayload.photoURL = newPhotoURL;
          }

          await updateFirebaseProfile(auth.currentUser, updatePayload);

          setUser({
            ...user,
            ...updatedUserData
          });
        }

        message.success("Cập nhật thành công!");
        setAvatarFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Đổi mật khẩu qua Firebase Authentication
  const onChangePassword = async (values) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updatePassword(user, values.newPassword);
        message.success("Đổi mật khẩu thành công!");
        formPassword.resetFields();
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          message.error("Vui lòng đăng nhập lại để thực hiện thao tác này!");
        } else {
          message.error("Lỗi: " + error.message);
        }
      }
    }
  };

  return (
    <div className="user-info-container">
      <h2 className="page-title">Profile Settings</h2>
      
      {/* PHẦN 1: THAY ĐỔI THÔNG TIN CÁ NHÂN */}
      <Card className="info-card" title="Personal Information">
        <div className="avatar-section">
          <Avatar 
            size={100} 
            src={previewUrl || user.photoURL} 
            icon={<UserOutlined />} 
          />
          <Upload 
            showUploadList={false} 
            beforeUpload={handleUpload} // Truyền file trực tiếp vào hàm handleUpload
            accept="image/*"
          >
            <Button icon={<CameraOutlined />} className="change-avatar-btn">Change Avatar</Button>
          </Upload>
        </div>

        <Form
          form={formInfo}
          layout="vertical"
          initialValues={user}
          onFinish={onUpdateInfo}
        >
          <Form.Item label="Display Name" name="displayName" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Your name" />
          </Form.Item>
          <Form.Item label="Email (Read Only)" name="email">
            <Input disabled />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="muzia-btn">
            Save Changes
          </Button>
        </Form>
      </Card>

      {
        user.provider === "email" &&
        <>
          <Divider className="form-divider" />

          <Card className="info-card" title="Security" bordered={false}>
            <Form
              form={formPassword}
              layout="vertical"
              onFinish={onChangePassword}
            >
              <Form.Item 
                label="New Password" 
                name="newPassword" 
                rules={[{ required: true, min: 6, message: 'Password at least 6 characters' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
              </Form.Item>
              <Form.Item 
                label="Confirm Password" 
                name="confirm" 
                dependencies={['newPassword']}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
              </Form.Item>
              <Button type="default" htmlType="submit" danger className="muzia-btn-outline">
                Update Password
              </Button>
            </Form>
          </Card>
        </>}
    </div>
  );
};

export default UserInfo;