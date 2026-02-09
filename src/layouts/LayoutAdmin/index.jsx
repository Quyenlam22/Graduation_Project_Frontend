import { Button, Dropdown, Flex, Image, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import './LayoutAdmin.scss';
import logo from "../../assets/images/logo.png";
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useContext, useState } from "react";
import Notice from "../../components/Notice";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import MenuSiderAdmin from "../../components/MenuSider/MenuSiderAdmin";
import { changeStatus } from "../../services/authService";
import { signOut } from "firebase/auth";
import { AuthContext } from "../../Context/AuthProvider";
import { auth } from "../../firebase/config";

function LayoutAdmin () {
    const [collapse, setCollapse] = useState(false);
    const navigate = useNavigate();

    const {user} = useContext(AuthContext);

    const handleLogout = async () => {
        if (user?.uid) {
            try {
                // const token = await auth.currentUser.getIdToken();
                await changeStatus({ uid: user.uid, state: "offline" });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem("accessToken");
        await signOut(auth);
        navigate("/auth");
    };

    const login = [
        {
            key: "userinfo",
            label: <NavLink to="user-info">Thông tin tài khoản</NavLink>
        },
        {
            key: "logout",
            label: <span onClick={handleLogout}>Logout</span>
        }
    ]

    return (
        <>
            <Layout className="layout-default">
                <header className="header-admin">
                    <div className={"header-admin__logo " + (collapse && "header-admin__logo--collapse")}>
                        <div className="header-admin__logo__image">
                            <Image src={logo} alt="Logo"/>  
                        </div>
                        {!collapse ? <h3>Muzia</h3> : null}
                    </div>
                    <div className="header-admin__nav">
                        <div className="header-admin__nav-left">
                            <div className="header-admin__collapse" onClick={() => setCollapse(!collapse)}>
                                {collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </div>
                        </div>
                        <div className="header-admin__nav-right">
                            <div className="header-admin__nav-right__notify">
                                <Notice />
                            </div>
                            <div className="header-admin__nav-right__auth">
                                <Dropdown menu={{ items:login }} placement="bottom">
                                    <Button>{user ? user.displayName : <UserOutlined />}</Button>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>
                <Layout>
                    <Sider theme={"light"} className="sider" collapsed={collapse}>
                        <MenuSiderAdmin />
                    </Sider>
                    <Content className="content-admin">
                        <Outlet/>
                    </Content>
                </Layout>
                {/* <Footer>Footer</Footer> */}
            </Layout>
        </>
    )
}

export default LayoutAdmin;