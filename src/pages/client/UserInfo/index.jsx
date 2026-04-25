import { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, Card, Divider, message, Avatar, Upload } from 'antd';
import { UserOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';
import { updatePassword } from "firebase/auth";
import './UserInfo.scss';
import { auth } from '../../../firebase/config';
import { updateProfile } from '../../../services/authService';
import { AuthContext } from '../../../Context/AuthProvider';
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { useTranslation } from "react-i18next";
import useTitle from '../../../hooks/useTitle';

const UserInfo = () => {
  const { t } = useTranslation();
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useTitle(t('admin.info_user'));

  useEffect(() => {
    if (user) {
      formInfo.setFieldsValue(user);
    }
  }, [user, formInfo]);

  const handleUpload = (file) => {
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false;
  };

  const onUpdateInfo = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("displayName", values.displayName);
      if (avatarFile) {
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
          setUser({ ...user, ...updatedUserData });
        }

        message.success(t('user.update_success'));
        setAvatarFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      message.error(t('common.error_occurred') + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values) => {
    const userAuth = auth.currentUser;
    if (userAuth) {
      try {
        await updatePassword(userAuth, values.newPassword);
        message.success(t('user.password_success'));
        formPassword.resetFields();
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          message.error(t('user.error_relogin'));
        } else {
          message.error(t('common.error_occurred') + ": " + error.message);
        }
      }
    }
  };

  return (
    <div className="user-info-container">
      <h2 className="page-title">{t('user.page_title')}</h2>

      <Card className="info-card" title={t('user.personal_info')}>
        <div className="avatar-section">
          <Avatar
            size={100}
            src={previewUrl || user.photoURL}
            icon={<UserOutlined />}
          />
          <Upload
            showUploadList={false}
            beforeUpload={handleUpload}
            accept="image/*"
          >
            <Button icon={<CameraOutlined />} className="change-avatar-btn">
              {t('user.change_avatar')}
            </Button>
          </Upload>
        </div>

        <Form
          form={formInfo}
          layout="vertical"
          onFinish={onUpdateInfo}
        >
          <Form.Item
            label={t('auth.placeholder_name')}
            name="displayName"
            rules={[{ required: true, message: t('user.error_name_required') }]}
          >
            <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={t('auth.placeholder_name')} />
          </Form.Item>
          <Form.Item label={t('user.email_readonly')} name="email">
            <Input disabled />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="muzia-btn">
            {t('user.btn_save')}
          </Button>
        </Form>
      </Card>

      <Divider className="form-divider" />
      <Card className="info-card" title={t('user.security')} bordered={false}>
        <Form
          form={formPassword}
          layout="vertical"
          onFinish={onChangePassword}
        >
          <Form.Item
            label={t('user.new_password')}
            name="newPassword"
            rules={[{ required: true, min: 6, message: t('auth.error_weak_password') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('user.placeholder_new_pass')} />
          </Form.Item>
          <Form.Item
            label={t('user.confirm_password')}
            name="confirm"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('user.error_confirm_required') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.error_password_match')));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('user.placeholder_confirm_pass')} />
          </Form.Item>
          <Button type="default" htmlType="submit" danger className="muzia-btn-outline">
            {t('user.btn_update_pass')}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default UserInfo;