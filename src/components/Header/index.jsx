import { Button, Image, Space } from "antd"; // Thêm Space
import { useEffect, useState, useContext } from 'react';
import Notice from "../../components/Notice";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import logo from "../../assets/images/logo.png";
import { AuthContext } from "../../Context/AuthProvider";
import { AppContext } from "../../Context/AppProvider";
import { changeStatus } from "../../services/authService";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../../firebase/config";
import Search from "../Search";
import { useTranslation } from "react-i18next"; // Import i18n

function HeaderClient(props) {
    const { setCollapse, collapse } = props;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { messageApi } = useContext(AppContext);
    const { t, i18n } = useTranslation(); // Khai báo t và i18n
    const [isMobile, setIsMobile] = useState(window.innerWidth < 560);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 560);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Hàm thay đổi ngôn ngữ
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("muzia_lang", lng);
    };

    const handleLogout = async () => {
        if (user?.uid) {
            try {
                await changeStatus({ uid: user.uid, state: "offline" });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem("accessToken");
        await signOut(auth);
        messageApi.success(t('auth.logout_success')) // Dùng đa ngôn ngữ
        navigate("/");
    };

    return (
        <>
            <header className="header-client">
                <div className={"header-client__logo " + (collapse && "header-client__logo--collapse")}>
                    <div className="header-client__logo__image">
                        <Image src={logo} alt="Logo" />
                    </div>
                    {!collapse ? <h3>Muzia</h3> : null}
                </div>
                <div className="header-client__nav">
                    <div className="header-client__nav-left">
                        <div className="header-client__collapse" onClick={() => setCollapse(!collapse)}>
                            {collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </div>
                    </div>
                    <div className="header-client__nav-between">
                        <div className="header-client__search">
                            <Search />
                        </div>
                    </div>

                    <div className="header-client__nav-right">
                        <Space size={2} className="header-client__lang-switch">
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

                        {user ? (
                            <>
                                <div className="header-client__nav-right__notify">
                                    <Notice />
                                </div>
                                <div className="header-client__nav-right__auth">
                                    {
                                        user && user.photoURL ?
                                            <Image
                                                preview={false}
                                                src={user.photoURL}
                                                className="user-info"
                                                onClick={() => { navigate("/user-info") }}
                                            /> :
                                            <Button
                                                icon={<UserOutlined />}
                                                className="user-info"
                                                onClick={() => { navigate("/user-info") }}
                                            />
                                    }
                                    <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>{!isMobile && t('auth.logout')}</Button>
                                </div>
                            </>
                        ) : (
                            <div className="header-client__nav-right__guest">
                                <Button
                                    className="btn-signin"
                                    icon={<UserOutlined />}
                                    onClick={() => navigate("/auth")}
                                >
                                    {!isMobile && t('auth.sign_in')}
                                </Button>
                            </div>
                        )
                        }
                    </div>
                </div>
            </header>
        </>
    )
}

export default HeaderClient;