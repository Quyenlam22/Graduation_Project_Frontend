import { createContext, useState, useEffect } from "react";
import { getAllUsers } from "../services/authService";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      if (res.success) {
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