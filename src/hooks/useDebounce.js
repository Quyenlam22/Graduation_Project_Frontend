import { useState, useEffect } from "react";

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Thiết lập một timer để cập nhật debouncedValue sau khoảng thời gian delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: Xóa timer cũ nếu value hoặc delay thay đổi trước khi timer chạy xong
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};