import { Select, Modal, Form, Input } from 'antd';
import { useContext, useState } from 'react';
import { createAdminAccount } from '../../services/authService';
import { AppContext } from '../../Context/AppProvider'; // Đảm bảo import đúng AppContext của bạn

function CreateUser(props) {
  const { isModalOpen, setIsModalOpen, onSuccess } = props; 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(AppContext);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await createAdminAccount(values);

      // Nếu API thành công (status 201)
      if (response && response.success) {
        messageApi.success("Admin account created successfully!");
        form.resetFields();
        setIsModalOpen(false);
        if (onSuccess) onSuccess(); 
      } else {
        messageApi.error(response?.message || "Failed to create admin account.");
      }

    } catch (error) {
      console.error("Create Admin Error:", error);

      // KIỂM TRA LỖI TỪ SERVER TRẢ VỀ (400 Bad Request)
      if (error) {
        // Backend của bạn trả về { success: false, message: "..." }
        messageApi.error(error.message || "Server rejected the request.");
      } 
      // KIỂM TRA LỖI VALIDATION CỦA ANTD FORM
      else if (error.errorFields) {
        return; // Không cần báo lỗi vì Antd đã hiện ở input
      } 
      // CÁC LỖI KHÁC (Network, code...)
      else {
        messageApi.error("A system error occurred. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      title="Add New Admin" 
      open={isModalOpen} 
      onOk={handleOk} 
      onCancel={() => {
        form.resetFields();
        setIsModalOpen(false);
      }}
      confirmLoading={loading}
      okText="Create"
      cancelText="Cancel"
      destroyOnClose={true} // Tự động xóa dữ liệu cũ khi đóng modal
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ role: 'admin' }}
      >
        <Form.Item
          name="displayName"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter the full name!' }]}
        >
          <Input placeholder="E.g. John Doe" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter the email!' },
            { type: 'email', message: 'The input is not valid E-mail!' }
          ]}
        >
          <Input placeholder="admin@example.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter the password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item name="role" label="Role">
          <Select disabled>
            <Select.Option value="admin">ADMIN</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateUser;