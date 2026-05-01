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
      const isAdminRoute = location.pathname.startsWith("/admin");
      const isAuthRoute = location.pathname === "/auth";
      const isAdminLoginRoute = location.pathname === "/admin/login";

      if (firebaseUser) {
        await firebaseUser.reload();
        const idToken = await firebaseUser.getIdToken(true);
        localStorage.setItem("accessToken", idToken);

        try {
          const response = await infoUser(firebaseUser.uid);

          if (response) {
            setUser(response);

            if (isAuthRoute) {
              navigate("/");
            }
            if (isAdminLoginRoute && response.role === 'admin') {
              navigate("/admin/dashboard");
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