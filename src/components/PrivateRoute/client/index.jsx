import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import { AppContext } from "../../../Context/AppProvider";
import { useTranslation } from "react-i18next";

const PrivateRouteClient = () => {
  const { t } = useTranslation(); 
  const { user, loading } = useContext(AuthContext); 
  const { messageApi } = useContext(AppContext);

  useEffect(() => {
    if (!loading && !user) {
      messageApi.error(t('auth.login_required'));
    }
  }, [user, loading, messageApi, t]);

  if (loading) {
    return null; 
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRouteClient;