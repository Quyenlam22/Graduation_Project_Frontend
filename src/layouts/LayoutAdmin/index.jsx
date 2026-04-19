import { Button, Dropdown, Image, Layout, Space } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import './LayoutAdmin.scss';
import logo from "../../assets/images/logo.png";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { useContext, useState } from "react";
import Notice from "../../components/Notice";
import { Outlet, useNavigate } from "react-router-dom";
import MenuSiderAdmin from "../../components/MenuSider/MenuSiderAdmin";
import { changeStatus } from "../../services/authService";
import { signOut } from "firebase/auth";
import { AuthContext } from "../../Context/AuthProvider";
import { auth } from "../../firebase/config";
import { useTranslation } from "react-i18next";

function LayoutAdmin() {
    const [collapse, setCollapse] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("muzia_lang", lng);
    };

    const handleLogout = async () => {
        if (user?.uid) {
            try {
                // const token = await auth.currentUser.getIdToken();
                await changeStatus({ uid: user.uid, state: "offline" });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem("accessToken");
        await signOut(auth);
        navigate("/admin/login");
    };

    const login = [
        {
            key: "userinfo",
            label: <span onClick={() => navigate("/user-info")}>{t('admin.info_user')}</span>
        },
        {
            key: "logout",
            label: <span onClick={handleLogout}>{t('auth.logout')}</span>
        }
    ]

    return (
        <>
            <Layout className="layout-default">
                <header className="header-admin">
                    <div className={"header-admin__logo " + (collapse && "header-admin__logo--collapse")}>
                        <div className="header-admin__logo__image">
                            <Image src={logo} alt="Logo" preview={false} />
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
                            {/* 4. Thêm bộ chuyển đổi ngôn ngữ vào Header Admin */}
                            <Space size={2} className="header-admin__lang-switch" style={{ marginRight: '20px' }}>
                                <Button
                                    type="text"
                                    size="small"
                                    style={{
                                        color: i18n.language === 'vi' ? '#FE2851' : '#9CA3A1',
                                        fontWeight: i18n.language === 'vi' ? 'bold' : 'normal',
                                        padding: '0 4px'
                                    }}
                                    onClick={() => changeLanguage('vi')}
                                >
                                    VI
                                </Button>
                                <span style={{ color: '#393243' }}>|</span>
                                <Button
                                    type="text"
                                    size="small"
                                    style={{
                                        color: i18n.language === 'en' ? '#FE2851' : '#9CA3A1',
                                        fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                                        padding: '0 4px'
                                    }}
                                    onClick={() => changeLanguage('en')}
                                >
                                    EN
                                </Button>
                            </Space>

                            <div className="header-admin__nav-right__notify">
                                <Notice />
                            </div>
                            <div className="header-admin__nav-right__auth">
                                <Dropdown menu={{ items: login }} placement="bottom">
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
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default LayoutAdmin;