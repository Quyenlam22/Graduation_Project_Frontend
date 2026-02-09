import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authWithEmail } from "../../../utils/authWithEmail";
import { changeStatus, infoUser } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';

const LoginAdmin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Đăng nhập Firebase
      const firebaseUser = await authWithEmail(loginData.email, loginData.password, "login");

      // 2. LẤY TOKEN MỚI NHẤT NGAY LẬP TỨC
      const token = await firebaseUser.getIdToken();
      
      // Lưu vào localStorage ngay để các request sau (như /status) có thể dùng
      localStorage.setItem("accessToken", token);

      // 3. Gọi API lấy thông tin User 
      // Nếu hàm infoUser của bạn cho phép nhận token làm tham số thứ 2, hãy truyền nó vào
      // Ví dụ: const dbUser = await infoUser(firebaseUser.uid, token);
      const dbUser = await infoUser(firebaseUser.uid);

      // 4. Kiểm tra quyền Admin
      if (dbUser && dbUser.role === 'admin') {
        messageApi.success("Welcome Admin!");
        
        // 5. Cập nhật trạng thái Online (Bây giờ đã có Token nên sẽ không lỗi 401)
        await changeStatus({ uid: firebaseUser.uid, state: "online" });

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 500);
      } else {
        await auth.signOut();
        localStorage.removeItem("accessToken");
        messageApi.error("You don't have access!");
      }
    } catch (error) {
      console.error("Login detail error:", error);
      messageApi.error("Incorrect account or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-admin">
      <h1>Login Admin</h1>
      <div className="content-w3ls">
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <input type="email" name="email" placeholder="Admin Email" onChange={handleChange} required />
          </div>
          <div className="form-control">
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "CHECKING..." : "LOGIN ADMIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;