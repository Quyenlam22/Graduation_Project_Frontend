import { Button, Flex } from 'antd';
import "./Error404.scss";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Error404() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Flex className="error-page" align="center" justify="center">
      <div className="error-page__container">
        <div className="error-page__code">
          <h3 className="error-page__subtitle">{t('error.oops')}</h3>
          <h1 className="error-page__number">
            <span>4</span><span>0</span><span>4</span>
          </h1>
        </div>
        <h2 className="error-page__message">
          {t('error.message')}
        </h2>
        <Button className="error-page__button" size='large' onClick={() => navigate('/')}>
          {t('error.btn_back')}
        </Button>
      </div>
    </Flex>
  );
}

export default Error404;