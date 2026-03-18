import { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import SearchPreview from "./SearchPreview";
import "./Search.scss";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useDebounce"; 
import { useNavigate } from "react-router";

function Search() {
  const { t } = useTranslation();
  const [isFocus, setIsFocus] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Sử dụng debounce 500ms để tránh gọi API liên tục
  const debouncedKeyword = useDebounce(keyword, 500);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleSearchSubmit = () => {
    if (keyword.trim()) {
      setIsFocus(false);
      navigate(`/search-all?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <Input 
        placeholder={t('search.placeholder')} 
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} 
        suffix={<SearchOutlined onClick={handleSearchSubmit} style={{ cursor: 'pointer', color: '#FE2851' }} />} 
        onPressEnter={handleSearchSubmit}
        variant="filled"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setIsFocus(true)}
        className="custom-search-input"
        autoComplete="off"
        style={{ 
          borderRadius: '20px',
          backgroundColor: '#2F2739',
          border: 'none',
          color: "#fff",
          padding: "8px 15px"
        }} 
      />

      <SearchPreview 
        visible={isFocus && debouncedKeyword.trim().length > 0} 
        keyword={debouncedKeyword} 
      />
    </div>
  );
}

export default Search;