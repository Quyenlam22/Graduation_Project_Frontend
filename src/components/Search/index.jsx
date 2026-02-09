import { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import SearchPreview from "./SearchPreview";
import "./Search.scss";

function Search() {
  const [isFocus, setIsFocus] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchRef = useRef(null);

  // Đóng preview khi người dùng click ra ngoài khu vực tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-wrapper" ref={searchRef}>
      <Input 
        placeholder="Search for songs, artists, albums..." 
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} 
        variant="filled"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setIsFocus(true)}
        className="custom-search-input"
        style={{ 
          borderRadius: '20px', 
          width: '400px',
          backgroundColor: '#2F2739',
          border: 'none',
          color: "#fff",
          padding: "8px 15px"
        }} 
      />

      {/* Chỉ hiển thị preview khi có từ khóa và đang focus vào ô input */}
      <SearchPreview visible={isFocus && keyword.trim().length > 0} />
    </div>
  );
}

export default Search;