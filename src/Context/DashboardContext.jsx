import { createContext, useState, useEffect } from "react";
import { overview } from "../services/dashboardService";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const refreshStats = async (force = false) => {
    if (isFetched && !force) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await overview();
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