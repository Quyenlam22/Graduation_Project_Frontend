import { Select, Modal, Form, Input, Upload, InputNumber, Row, Col } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppProvider';
import { getAllArtists } from '../../services/artistService'; // Import service lấy artist
import { createAlbum, updateAlbum } from '../../services/albumService'; // Import service album

const { TextArea } = Input;

function CreateAlbum(props) {
  const { isModalOpen, setIsModalOpen, onSuccess, data, onCancel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [artists, setArtists] = useState([]); // State lưu danh sách artist thật

  const { messageApi } = useContext(AppContext);
  const isEdit = !!data;

  // 1. Lấy danh sách Artist từ Backend khi mở Modal
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await getAllArtists();
        if (res.success) {
          setArtists(res.data);
        }
      } catch (error) {
        console.error("Error retrieving the list of Artists: ", error);
      }
    };

    if (isModalOpen) {
      fetchArtists();
      if (data) {
        // Nếu là Edit: Đổ dữ liệu vào Form
        form.setFieldsValue({
          title: data.title,
          status: data.status,
          artistId: data.artistId,
          deezerId: data.deezerId,
          description: data.description,
        });
        if (data.avatar) {
          setFileList([{ uid: '-1', name: 'album_cover.png', status: 'done', url: data.avatar }]);
        }
      } else {
        // Nếu là Create: Reset Form
        form.resetFields();
        setFileList([]);
      }
    }
  }, [data, isModalOpen, form]);

  // 2. Xử lý gửi dữ liệu (Create/Update)
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Tìm tên Artist tương ứng với ID đã chọn để gửi lên Backend (nếu Backend cần artistName)
      const selectedArtist = artists.find(a => a._id === values.artistId);
      
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('status', values.status);
      formData.append('artistId', values.artistId);
      formData.append('artistName', selectedArtist?.name || ''); 
      formData.append('description', values.description || '');
      if (values.deezerId) formData.append('deezerId', values.deezerId);

      // Xử lý File ảnh
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      let response;
      if (isEdit) {
        response = await updateAlbum(data._id, formData);
      } else {
        response = await createAlbum(formData);
      }

      if (response && response.success) {
        messageApi.success(response.message);
        handleCancel(); // Đóng modal và reset
        if (onSuccess) onSuccess(); // Reload table ở trang Management
      } else {
        messageApi.error(response.message);
      }
    } catch (error) {
      console.error("Album Error:", error);
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
    <Modal 
      title={isEdit ? "Edit Album" : "Create New Album"} 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      okText={isEdit ? "Update" : "Create"}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label="Album Title" rules={[{ required: true, message: 'Vui lòng nhập tên Album' }]}>
              <Input placeholder="Ex: 22, Loi Choi..." />
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
            <Form.Item name="artistId" label="Artist Ownership" rules={[{ required: true, message: 'Vui lòng chọn nghệ sĩ' }]}>
              <Select 
                placeholder="Choose Artist" 
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

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Description of this album..." />
        </Form.Item>

        <Form.Item label="Album Cover (Avatar)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
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
  );
}

export default CreateAlbum;