import { createContext } from "react";
import { message } from "antd";

export const AppContext = createContext();

export default function AppProvider({ children }) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <AppContext.Provider value={{ messageApi }}>
      {contextHolder}
      {children}
    </AppContext.Provider>
  );
}