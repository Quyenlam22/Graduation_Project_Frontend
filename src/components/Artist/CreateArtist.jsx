import { Select, Modal, Form, Input, Upload, InputNumber, Row, Col } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { createArtist, updateArtist } from '../../services/artistService';
import { useTranslation } from 'react-i18next';

function CreateArtist(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const { t } = useTranslation();
  
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  useEffect(() => {
    if (isModalOpen) {
      if (data) {
        form.setFieldsValue({
            name: data.name,
            nb_fan: data.nb_fan,
            status: data.status,
            deezerId: data.deezerId
        });
        if (data.avatar) {
          setFileList([{ uid: '-1', name: 'avatar.png', status: 'done', url: data.avatar }]);
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
      formData.append('name', values.name);
      formData.append('nb_fan', values.nb_fan || 0);
      formData.append('status', values.status);
      if (values.deezerId) formData.append('deezerId', values.deezerId);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      let response = isEdit ? await updateArtist(data._id, formData) : await createArtist(formData);

      if (response && response.success) {
        messageApi.success(t('common.operation_success'));
        handleCancelInternal();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      messageApi.error(t('common.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInternal = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
    if (onCancel) onCancel();
  };

  return (
    <Modal 
      title={isEdit ? t('artist.edit_title') : t('artist.create_title')} 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={handleCancelInternal}
      confirmLoading={loading}
      okText={isEdit ? t('common.update') : t('common.create')}
      cancelText={t('common.cancel') || "Cancel"}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label={t('artist.form_name')} rules={[{ required: true, message: t('artist.error_name') }]}>
          <Input placeholder={t('artist.placeholder_name')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nb_fan" label={t('artist.form_fans')} initialValue={0}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label={t('common.status')} initialValue="active">
              <Select>
                <Select.Option value="active">{t('common.active')}</Select.Option>
                <Select.Option value="inactive">{t('common.inactive')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="deezerId" label={t('artist.form_deezer')}>
            <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Avatar">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>{t('common.loading')}</div></div>}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateArtist;