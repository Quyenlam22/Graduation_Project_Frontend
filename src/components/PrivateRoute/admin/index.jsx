// components/PrivateRoute/admin/index.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";

const PrivateRouteAdmin = () => {
  const { user } = useContext(AuthContext);

  // 1. Kiểm tra nếu chưa đăng nhập hoặc không phải admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. Nếu là Admin, Outlet sẽ render các component con 
  // (Ví dụ: LayoutAdmin, Dashboard...)
  return <Outlet />; 
};

export default PrivateRouteAdmin;