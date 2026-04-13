import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authWithEmail } from "../../../utils/authWithEmail";
import { changeStatus, infoUser } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';
import { auth, googleProvider } from '../../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { Divider } from 'antd';

const LoginAdmin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(AppContext);
  const navigate = useNavigate();

  // Hàm xử lý kiểm tra quyền Admin dùng chung
  const verifyAdminAndLogin = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem("accessToken", token);

      const dbUser = await infoUser(firebaseUser.uid);

      if (dbUser && dbUser.role === 'admin') {
        messageApi.success("Welcome Admin!");

        // Dùng try-catch nhỏ ở đây để nếu refresh lỗi cũng không làm hỏng cả quá trình login
        try {
          if (typeof refreshUsers === 'function') await refreshUsers();
        } catch (e) {
          console.error("Refresh users failed but continuing...", e);
        }

        await changeStatus({ uid: firebaseUser.uid, state: "online" });
        navigate("/admin/dashboard");
        return true; // Trả về true nếu là admin thành công
      } else {
        await auth.signOut();
        localStorage.removeItem("accessToken");
        messageApi.error("Access Denied: You are not an Admin!");
        return false;
      }
    } catch (error) {
      console.error("Verify Admin Error:", error);
      throw error; // Quăng lỗi để hàm gọi nó xử lý
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const firebaseUser = await authWithEmail(loginData.email, loginData.password, "login");
      await verifyAdminAndLogin(firebaseUser);
    } catch (error) {
      // Chỉ hiện lỗi này nếu thực sự sai pass/email
      messageApi.error("Incorrect account or password!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Chạy hàm verify, nếu bên trong có lỗi thì nó mới nhảy xuống catch
      await verifyAdminAndLogin(result.user);
    } catch (error) {
      // Kiểm tra nếu người dùng chủ động đóng popup Google thì không hiện lỗi
      if (error.code !== 'auth/cancelled-popup-request') {
        messageApi.error("Google Login Failed!");
      }
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
            <input type="email" name="email" placeholder="Admin Email" onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
          </div>
          <div className="form-control">
            <input type="password" name="password" placeholder="Password" onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "CHECKING..." : "LOGIN WITH EMAIL"}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#aaa' }}>OR</Divider>
          <ul className="social-icons">
            <li><a href="#!" onClick={handleGoogleLogin}><FaGoogle /></a></li>
          </ul>

        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;