import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaFacebookF, FaGoogle, FaGithub } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, fbProvider, googleProvider } from "../../../firebase/config";
import { AuthContext } from "../../../Context/AuthProvider";
// import { AppContext } from "../../../Context/AppProvider"; 
// import { addDocument } from "../../../firebase/services";
// import { serverTimestamp } from "firebase/firestore";
import { authWithEmail } from "../../../utils/authWithEmail";
import useTitle from "../../../hooks/useTitle";
import "./Auth.scss";
import { register } from '../../../services/authService';
import { AppContext } from '../../../Context/AppProvider';

const Auth = () => {
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
  
  useTitle(isLoginMode ? 'Login' : 'Register');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, displayName } = formData;

    if (!isLoginMode && password !== confirmPassword) {
      messageApi.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const mode = isLoginMode ? "login" : "register";
      const data = await authWithEmail(email, password, mode, displayName);
      
      // messageApi.success(`${isLoginMode ? 'Login' : 'Register'} successfully!`);
      messageApi.success(`Hello ${data.displayName}`);
      
      navigate("/");
    } catch (error) {
      console.error("Auth Error Code:", error.code);
      
      // Xử lý bắt lỗi chi tiết từ Firebase
      let errorText = "An error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorText = "This email is already in the system!";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorText = "Invalid email or password!";
      } else if (error.code === 'auth/weak-password') {
        errorText = "Password should be at least 6 characters!";
      } else if (error.code === 'auth/invalid-email') {
        errorText = "Invalid email format!";
      }

      messageApi.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      
      const idToken = await result.user.getIdToken(true);
      localStorage.setItem("accessToken", idToken);

      console.log(result);
      

      const loginMethod = result.user.providerData[0]?.providerId === "google.com" ? "google" : "social";

      await register({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: loginMethod,
        role: "user" // Mặc định cho social login
      })

      messageApi.success(`Hello ${result.user.displayName}`);

      navigate("/");
    } catch (error) {
      console.error("Social Login failed!", error);
    }
  };

  useEffect(() => {
    const isLogout = localStorage.getItem("logout");
    if (isLogout === "true") {
      messageApi.success('Logged out successfully!');
      localStorage.removeItem("logout");
    }
  }, [messageApi]);

  if (user) return null;

  return (
    <div className="auth-container">
      <h1>{isLoginMode ? "Login Form" : "Register Form"}</h1>
      <div className="content-w3ls">
        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-control">
              <input 
                type="text" name="displayName" placeholder="Display Name" 
                value={formData.displayName} onChange={handleChange} required 
              />
            </div>
          )}
          <div className="form-control">
            <input 
              type="email" name="email" placeholder="Email Address" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>
          <div className="form-control">
            <input 
              type="password" name="password" placeholder="Password" 
              value={formData.password} onChange={handleChange} required 
            />
          </div>
          {!isLoginMode && (
            <div className="form-control">
              <input 
                type="password" name="confirmPassword" placeholder="Confirm Password" 
                value={formData.confirmPassword} onChange={handleChange} required 
              />
            </div>
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "PROCESSING..." : (isLoginMode ? "LOGIN" : "REGISTER")}
          </button>
        </form>

        <p className="social-text">Or Login With</p>
        <ul className="social-icons">
          <li><a href="#!" onClick={() => handleSocialLogin(fbProvider)}><FaFacebookF /></a></li>
          <li><a href="#!" onClick={() => handleSocialLogin(googleProvider)}><FaGoogle /></a></li>
          <li><a href="#!"><FaGithub /></a></li>
        </ul>
        
        <p className="social-text">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "} 
          <Link 
            className="text" 
            onClick={() => {
                setIsLoginMode(!isLoginMode);
                setFormData({ displayName: '', email: '', password: '', confirmPassword: '' });
            }}
          >
            {isLoginMode ? "Register Now" : "Login Now"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;