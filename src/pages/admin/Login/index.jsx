import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authWithEmail } from "../../../utils/authWithEmail";
import { changeStatus, infoUser } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';
import { auth, googleProvider } from '../../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { Divider } from 'antd';
import useTitle from '../../../hooks/useTitle';
import { useTranslation } from "react-i18next";

const LoginAdmin = () => {
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { messageApi } = useContext(AppContext);
  const navigate = useNavigate();

  useTitle("Admin");

  const verifyAdminAndLogin = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem("accessToken", token);

      const dbUser = await infoUser(firebaseUser.uid);

      if (dbUser && dbUser.role === 'admin') {
        messageApi.success(t('admin.welcome_admin'));

        try {
          if (typeof refreshUsers === 'function') await refreshUsers();
        } catch (e) {
          console.error("Refresh users failed but continuing...", e);
        }

        await changeStatus({ uid: firebaseUser.uid, state: "online" });
        navigate("/admin/dashboard");
        return true;
      } else {
        await auth.signOut();
        localStorage.removeItem("accessToken");
        messageApi.error(t('auth.permission_denied')); 
        return false;
      }
    } catch (error) {
      console.error("Verify Admin Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const firebaseUser = await authWithEmail(loginData.email, loginData.password, "login");
      await verifyAdminAndLogin(firebaseUser);
    } catch (error) {
      messageApi.error(t('admin.error_login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await verifyAdminAndLogin(result.user);
    } catch (error) {
      if (error.code !== 'auth/cancelled-popup-request') {
        messageApi.error(t('admin.error_google'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-admin">
      <h1>{t('admin.login_title')}</h1>
      <div className="content-w3ls">
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <input 
              type="email" 
              name="email" 
              placeholder={t('auth.placeholder_email')} 
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
              required 
            />
          </div>
          <div className="form-control">
            <input 
              type="password" 
              name="password" 
              placeholder={t('auth.placeholder_password')}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
              required 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? t('auth.processing') : t('admin.btn_login_email')}
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