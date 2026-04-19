import { Input, Select, Space, Button, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const { Search } = Input;

const FilterBar = ({ 
  onFilterChange, 
  placeholder,
  options,
  filterLabel,
  initialValues = { keyword: '', status: undefined } 
}) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(initialValues.keyword);
  const [status, setStatus] = useState(initialValues.status);

  const defaultPlaceholder = placeholder || t('common.placeholder_search');
  const defaultFilterLabel = filterLabel || t('common.all_status');
  const defaultOptions = options || [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') }
  ];

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
          placeholder={defaultPlaceholder}
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          enterButton={
            <Button type="primary" icon={<SearchOutlined />}>
              {t('common.search')}
            </Button>
          }
          style={{ width: 350 }}
        />

        <Select
          placeholder={defaultFilterLabel}
          style={{ width: 150 }}
          allowClear
          value={status}
          onChange={handleStatusChange}
          options={defaultOptions} 
        />

        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          {t('common.refresh')}
        </Button>
      </Space>
    </Card>
  );
};

export default FilterBar;