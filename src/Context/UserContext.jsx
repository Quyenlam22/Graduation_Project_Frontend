import { createContext, useState, useEffect } from "react";
import { getAllUsers } from "../services/authService";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshUsers = async () => {
    // CHẶN: Nếu không có token thì không gọi API tốn tài nguyên và gây lỗi 401
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await getAllUsers();
      // res bây giờ sẽ không bao giờ là null nhờ Bước 1
      if (res && res.success) {
        setUsers(res.data.map(item => ({ ...item, key: item._id })));
      }
    } catch (error) {
      console.error("Context Fetch Users Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
}