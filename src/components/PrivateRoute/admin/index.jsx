import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

const PrivateRouteAdmin = () => {
  const { user, loading } = useContext(AuthContext);
  const { messageApi } = useContext(AppContext);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        messageApi.error("Please login to access!");
      } else if (user.role !== 'admin') {
        messageApi.error("Access denied! You do not have Admin permissions.");
      }
    }
  }, [user, loading, messageApi]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Checking permissions...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />; 
};

export default PrivateRouteAdmin;