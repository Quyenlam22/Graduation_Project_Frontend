import {
  Select,
  Modal,
  Form,
  Input,
  Upload,
  InputNumber,
  Row,
  Col,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { AppContext } from "../../Context/AppProvider";
import { ArtistContext } from "../../Context/ArtistContext"; // IMPORT ARTIST CONTEXT
import { createAlbum, updateAlbum } from "../../services/albumService";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

function CreateAlbum(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const { t } = useTranslation();

  const { artists } = useContext(ArtistContext);
  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  useEffect(() => {
    if (isModalOpen) {
      if (data) {
        form.setFieldsValue({
          title: data.title,
          status: data.status,
          artistId: data.artistId,
          deezerId: data.deezerId,
          description: data.description,
        });
        if (data.avatar) {
          setFileList([
            {
              uid: "-1",
              name: "album_cover.png",
              status: "done",
              url: data.avatar,
            },
          ]);
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

      const selectedArtist = artists.find((a) => a._id === values.artistId);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("status", values.status);
      formData.append("artistId", values.artistId);
      formData.append("artistName", selectedArtist?.name || "");
      formData.append("description", values.description || "");
      if (values.deezerId) formData.append("deezerId", values.deezerId);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      let response = isEdit
        ? await updateAlbum(data._id, formData)
        : await createAlbum(formData);

      if (response && response.success) {
        messageApi.success(t('common.operation_success'));
        handleCancel();
        if (onSuccess) onSuccess(); 
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
      title={isEdit ? t('album.edit_title') : t('album.create_title')} 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      okText={isEdit ? t('common.update') : t('common.create')}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label={t('album.form_title')} rules={[{ required: true, message: t('album.error_title') }]}>
              <Input placeholder={t('album.placeholder_title')} />
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
            <Form.Item name="artistId" label={t('album.form_artist')} rules={[{ required: true, message: t('album.error_artist') }]}>
              <Select 
                placeholder={t('album.placeholder_artist')} 
                showSearch 
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              >
                {artists.map(a => (
                  <Select.Option key={a._id} value={a._id}>{a.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="deezerId" label="Deezer ID (Sync)">
              <InputNumber style={{ width: '100%' }} placeholder="Album ID from Deezer" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label={t('album.form_description')}><TextArea rows={3} /></Form.Item>
        <Form.Item label={t('album.form_cover')}>
          <Upload listType="picture-card" fileList={fileList} beforeUpload={() => false} onChange={({ fileList: newFileList }) => setFileList(newFileList)} maxCount={1}>
            {fileList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>{t('common.loading')}</div></div>}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateAlbum;
