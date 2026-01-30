import { useContext } from "react";
import { AuthContext } from "../../../Context/AuthProvider";
import { auth } from "../../../firebase/config";
import { signOut } from "firebase/auth"; // Nhớ import hàm này từ firebase/auth
import { Button, Flex, Typography, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppProvider";
import { changeStatus } from "../../../services/authService";

const { Title } = Typography;

function Dashboard() {
  const user = useContext(AuthContext);
  const navigate = useNavigate();

  const { messageApi } = useContext(AppContext);

  const handleLogout = async () => {
    try {
      if (user?.uid) {
        // 2. Gọi API để cập nhật trạng thái offline trong MongoDB
        await changeStatus({ 
          uid: user.uid, 
          state: "offline" // Quan trọng: phải gửi trạng thái để Backend xử lý
        });
      }
    } catch (e) {
      console.error("Status update error when logging out:", e);
    } finally {
      // 3. Xóa dữ liệu cục bộ và đăng xuất khỏi Firebase
      localStorage.removeItem("accessToken");
      await signOut(auth);
      
      messageApi.success("Logout successfully");
      
      // 4. Điều hướng về trang login của Admin
      navigate("/admin/login");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 40 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Flex align="center" gap={15}>
          <Typography.Text strong>Admin: {user?.displayName || "Admin"}</Typography.Text>
          <Button 
            icon={<LogoutOutlined />} 
            danger 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Flex>
      
      <div className="admin-content">
        {/* Nội dung quản trị bài hát/album sẽ nằm ở đây */}
        <Title level={4}>Welcome to the music management system.</Title>
      </div>
    </div>
  );
}

export default Dashboard;