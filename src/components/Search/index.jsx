import { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import SearchPreview from "./SearchPreview";
import "./Search.scss";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useDebounce"; 
import { useNavigate, useSearchParams } from "react-router";

function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRef = useRef(null);

  // 1. Lấy keyword từ URL ngay khi khởi tạo để giữ chữ khi reload trang
  const queryFromUrl = searchParams.get('q') || "";
  const [keyword, setKeyword] = useState(queryFromUrl);
  const [isFocus, setIsFocus] = useState(false);

  // 2. Cập nhật lại ô Input khi người dùng nhấn Back/Forward hoặc thay đổi URL từ nơi khác
  useEffect(() => {
    const q = searchParams.get('q') || "";
    setKeyword(q);
  }, [searchParams]);

  // 3. Sử dụng debounce cho Search Preview (gợi ý kết quả nhanh)
  const debouncedKeyword = useDebounce(keyword, 500);

  // 4. Xử lý đóng Preview khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. Hàm thực hiện tìm kiếm chính thức (chuyển sang trang kết quả)
  const handleSearchSubmit = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      setIsFocus(false);
      // Bạn hãy kiểm tra route của mình là /search hay /search-all để khớp với SearchResult
      navigate(`/search-all?q=${encodeURIComponent(trimmedKeyword)}`);
    }
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <Input 
        placeholder={t('search.placeholder')} 
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} 
        suffix={
          <SearchOutlined 
            onClick={handleSearchSubmit} 
            style={{ cursor: 'pointer', color: '#FE2851' }} 
          />
        } 
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