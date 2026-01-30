import { Button, Flex } from 'antd';
import "./Error404.scss";
import { useNavigate } from 'react-router-dom';

function Error404() {
  const navigate = useNavigate();

  return (
    <Flex className="error-page" align="center" justify="center">
      <div className="error-page__container">
        <div className="error-page__code">
          <h3 className="error-page__subtitle">Oops! Page not found</h3>
          <h1 className="error-page__number">
            <span>4</span><span>0</span><span>4</span>
          </h1>
        </div>
        <h2 className="error-page__message">
          We are sorry, but the page you requested was not found
        </h2>
        <Button className="error-page__button" size='large' onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </Flex>
  );
}

export default Error404;
