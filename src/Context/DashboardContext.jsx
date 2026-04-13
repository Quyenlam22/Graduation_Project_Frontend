import { createContext, useState, useEffect } from "react";
import { overview } from "../services/dashboardService";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const refreshStats = async (force = false) => {
    // Nếu đã lấy dữ liệu rồi và không phải ép buộc (force) thì thôi
    if (isFetched && !force) return;

    // CHẶN: Nếu không có token thì không gọi API tránh lỗi 401
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await overview();
      // KIỂM TRA: res phải tồn tại (không null) và success là true
      if (res && res.success) {
        setStats(res.data);
        setIsFetched(true);
      }
    } catch (error) {
      console.error("Dashboard Provider Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardContext.Provider value={{ stats, loading, refreshStats, isFetched }}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;