import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaFacebookF, FaGoogle, FaGithub } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, fbProvider, googleProvider } from "../../../firebase/config";
import { AuthContext } from "../../../Context/AuthProvider";
import { authWithEmail } from "../../../utils/authWithEmail";
import useTitle from "../../../hooks/useTitle";
import "./Auth.scss";
import { register } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const { t } = useTranslation();
  const { messageApi } = useContext(AppContext);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ 
    displayName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useTitle(isLoginMode ? t('auth.login_form') : t('auth.register_form'));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, displayName } = formData;

    if (!isLoginMode && password !== confirmPassword) {
      messageApi.error(t('auth.error_password_match'));
      return;
    }

    setLoading(true);
    try {
      const mode = isLoginMode ? "login" : "register";
      const data = await authWithEmail(email, password, mode, displayName);
      
      messageApi.success(`${t('auth.hello')} ${data.displayName}`);
      navigate("/");
    } catch (error) {
      let errorKey = "auth.error_general";
      if (error.code === 'auth/email-already-in-use') {
        errorKey = "auth.error_email_exists";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorKey = "auth.error_invalid_auth";
      } else if (error.code === 'auth/weak-password') {
        errorKey = "auth.error_weak_password";
      } else if (error.code === 'auth/invalid-email') {
        errorKey = "auth.error_invalid_email";
      }

      messageApi.error(t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);
      localStorage.setItem("accessToken", idToken);

      const loginMethod = result.user.providerData[0]?.providerId === "google.com" ? "google" : "social";

      await register({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: loginMethod,
        role: "user"
      })

      messageApi.success(`${t('auth.hello')} ${result.user.displayName}`);
      navigate("/");
    } catch (error) {
      messageApi.error(t('auth.error_social'));
    }
  };

  useEffect(() => {
    const isLogout = localStorage.getItem("logout");
    if (isLogout === "true") {
      messageApi.success(t('auth.logout_success'));
      localStorage.removeItem("logout");
    }
  }, [messageApi, t]);

  if (user) return null;

  return (
    <div className="auth-container">
      <h1>{isLoginMode ? t('auth.login_form') : t('auth.register_form')}</h1>
      <div className="content-w3ls">
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-control">
              <input 
                type="text" name="displayName" placeholder={t('auth.placeholder_name')}
                value={formData.displayName} onChange={handleChange} required 
              />
            </div>
          )}
          <div className="form-control">
            <input 
              type="email" name="email" placeholder={t('auth.placeholder_email')}
              value={formData.email} onChange={handleChange} required 
            />
          </div>
          <div className="form-control">
            <input 
              type="password" name="password" placeholder={t('auth.placeholder_password')}
              value={formData.password} onChange={handleChange} required 
            />
          </div>
          {!isLoginMode && (
            <div className="form-control">
              <input 
                type="password" name="confirmPassword" placeholder={t('auth.placeholder_confirm')}
                value={formData.confirmPassword} onChange={handleChange} required 
              />
            </div>
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? t('auth.processing') : (isLoginMode ? t('auth.login_upper') : t('auth.register_upper'))}
          </button>
        </form>

        <p className="social-text">{t('auth.social_login')}</p>
        <ul className="social-icons">
          <li><a href="#!" onClick={() => handleSocialLogin(fbProvider)}><FaFacebookF /></a></li>
          <li><a href="#!" onClick={() => handleSocialLogin(googleProvider)}><FaGoogle /></a></li>
          <li><a href="#!"><FaGithub /></a></li>
        </ul>
        
        <p className="social-text">
          {isLoginMode ? t('auth.no_account') : t('auth.have_account')} 
          <Link 
            className="text" 
            onClick={() => {
                setIsLoginMode(!isLoginMode);
                setFormData({ displayName: '', email: '', password: '', confirmPassword: '' });
            }}
          >
            {isLoginMode ? t('auth.register_now') : t('auth.login_now')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;