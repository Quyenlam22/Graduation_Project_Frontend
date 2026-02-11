import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { useLocation, useNavigate } from "react-router-dom";
import { infoUser } from "../services/authService";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Xác định loại route hiện tại
      const isAdminRoute = location.pathname.startsWith("/admin");
      const isAuthRoute = location.pathname === "/auth";
      const isAdminLoginRoute = location.pathname === "/admin/login";

      if (firebaseUser) {
        await firebaseUser.reload(); 
        const idToken = await firebaseUser.getIdToken(true); // Lấy token mới nhất
        localStorage.setItem("accessToken", idToken);

        try {
          const response = await infoUser(firebaseUser.uid);
          
          if (response) {
            setUser(response); // response đã có role từ MongoDB

            // LOGIC ĐIỀU HƯỚNG KHI ĐÃ ĐĂNG NHẬP
            if (isAuthRoute) {
              navigate("/"); // User thường vào trang auth -> về home
            }
            if (isAdminLoginRoute && response.role === 'admin') {
              navigate("/admin/dashboard"); // Admin vào login admin -> về dashboard
            }
          } else {
            setUser({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              email: firebaseUser.email
            });
          }
        } catch (error) {
          console.error("Fetch MongoDB User Error:", error);
        }
      } else {
        // TRƯỜNG HỢP CHƯA ĐĂNG NHẬP (firebaseUser === null)
        setUser(null);
        localStorage.removeItem("accessToken");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {loading ? null : (
        children
      )}
    </AuthContext.Provider>
  );
}

export default AuthProvider;