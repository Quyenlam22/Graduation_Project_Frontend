import { Input, Select, Space, Button, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Search } = Input;

const FilterBar = ({ 
  onFilterChange, 
  placeholder = "Search...",
  // Mặc định là Active/Inactive nếu không truyền gì vào
  options = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'In Active' }
  ],
  filterLabel = "Status",
  initialValues = { keyword: '', status: undefined } 
}) => {
  const [keyword, setKeyword] = useState(initialValues.keyword);
  const [status, setStatus] = useState(initialValues.status);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ keyword, status });
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleStatusChange = (val) => {
    setStatus(val);
    onFilterChange({ keyword, status: val });
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(undefined);
    onFilterChange({ keyword: '', status: undefined });
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap size="middle">
        <Search
          placeholder={placeholder}
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
          style={{ width: 350 }}
        />

        <Select
          placeholder={filterLabel}
          style={{ width: 150 }}
          allowClear
          value={status}
          onChange={handleStatusChange}
          options={options} // Sử dụng options từ props
        />

        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Refresh
        </Button>
      </Space>
    </Card>
  );
};

export default FilterBar;