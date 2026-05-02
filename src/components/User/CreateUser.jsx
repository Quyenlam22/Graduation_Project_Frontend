import { Select, Modal, Form, Input, Upload, Image, Row, Col } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { createAdmin, updateUser } from '../../services/authService';
import { AppContext } from '../../Context/AppProvider';
import { useTranslation } from 'react-i18next';

function CreateUser(props) {
  const { t } = useTranslation();
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
        isEdit ? messageApi.success(t('common.update_success', { title: t('user.title') })) : messageApi.success(t('common.create_success', { title: t('user.title') }));
        handleClose();
        if (onSuccess) onSuccess();
      }
      else {
        messageApi.error(t('user.email_exists'));
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
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
        title={isEdit ? t('user.edit_title') : t('user.create_title')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleClose}
        confirmLoading={loading}
        okText={isEdit ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel') || "Cancel"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="displayName"
            label={t('user.form_fullname')}
            rules={[{ required: true, message: t('user.error_fullname') }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('auth.placeholder_email')}
            rules={[{ required: true, type: 'email', message: t('user.error_email_valid') }]}
          >
            <Input disabled={isEdit} placeholder={t('auth.placeholder_email')} />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              name="password"
              label={t('auth.placeholder_password')}
              rules={[{ required: true, min: 6, message: t('auth.error_weak_password') }]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>
          )}

          {isEdit && (
            <Form.Item label={t('user.change_avatar')}>
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
                    <div style={{ marginTop: 8 }}>{t('common.loading')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}

          <Form.Item name="role" label={t('user.form_role')} initialValue="admin">
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