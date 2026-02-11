import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";

const PrivateRouteClient = () => {
  const { user, loading } = useContext(AuthContext); // Nên lấy cả trạng thái loading
  const { messageApi } = useContext(AppContext);

  useEffect(() => {
    if (!loading && !user) {
      messageApi.error("Please login to continue!");
    }
  }, [user, loading, messageApi]);

  if (loading) {
    return null; // Hoặc một loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRouteClient;