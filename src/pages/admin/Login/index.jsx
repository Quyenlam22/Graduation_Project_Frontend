import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authWithEmail } from "../../../utils/authWithEmail";
import { infoUser } from '../../../services/authService';
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
      // 1. Đăng nhập Firebase thông qua hàm bạn đã viết
      const firebaseUser = await authWithEmail(loginData.email, loginData.password, "login");
      // const idToken = await firebaseUser.getIdToken();

      // 2. Gọi API lấy thông tin đầy đủ từ MongoDB để check Role
      const dbUser = await infoUser(firebaseUser.uid);

      // 3. Kiểm tra quyền Admin
      if (dbUser.role === 'admin') {
        messageApi.success("Welcome Admin!");
        navigate("/admin/dashboard"); // Chuyển vào trang quản trị
      } else {
        // Nếu không phải admin, đăng xuất ngay lập tức
        await auth.signOut();
        messageApi.error("You don't have access!");
      }
    } catch (error) {
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