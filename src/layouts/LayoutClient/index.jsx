import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import './LayoutClient.scss';
// import logo from  "../../images/logo.png";
import { useEffect, useState } from "react";
import MenuSider from "../../components/MenuSider";
import { Outlet } from "react-router-dom";
import HeaderClient from "../../components/Header";
import MusicPlayer from "../../components/MusicPlayer";

function LayoutClient () {
    const [collapse, setCollapse] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setCollapse(true); // Đóng lại nếu màn hình nhỏ
        } else {
          setCollapse(false); // Mở ra nếu màn hình lớn
        }
      };

      // Chạy lần đầu khi load trang
      handleResize();

      // Lắng nghe sự kiện thay đổi kích thước màn hình
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Layout className="layout-client">
                <HeaderClient setCollapse={setCollapse} collapse={collapse}/>
                <Layout>
                    <Sider style={{ backgroundColor: "#170F23" }} collapsed={collapse}>
                        <MenuSider/>
                    </Sider>
                    <Content className="content-client">
                        <Outlet/>
                    </Content>
                </Layout>
                <MusicPlayer/>
            </Layout>
        </>
    )
}

export default LayoutClient;