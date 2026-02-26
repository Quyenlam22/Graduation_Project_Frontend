import { Button, Image } from "antd";
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

function HeaderClient (props) {
  const { setCollapse, collapse } = props;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { messageApi } = useContext(AppContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 560);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 560);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
        if (user?.uid) {
            try {
                // const token = await auth.currentUser.getIdToken();
                await changeStatus({ uid: user.uid, state: "offline" });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem("accessToken");
        await signOut(auth);
        messageApi.success("Logout successfully!")
        navigate("/");
    };
    
  return (
      <>
        <header className="header-client">
          <div className={"header-client__logo " + (collapse && "header-client__logo--collapse")}>
              <div className="header-client__logo__image">
                  <Image src={logo} alt="Logo"/>  
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
                      <Search/>
                  </div>
              </div>
              <div className="header-client__nav-right">
                { user ? (
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
                                    onClick={() => {navigate("/user-info")}}
                                /> :
                                <Button 
                                    icon={<UserOutlined />} 
                                    className="user-info"
                                    onClick={() => {navigate("/user-info")}}
                                />
                            }
                            <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>{!isMobile && "Logout"}</Button>
                        </div>
                    </>
                    ) : (
                        <div className="header-client__nav-right__guest">
                            <Button 
                                className="btn-signin"
                                icon={<UserOutlined />} 
                                onClick={() => navigate("/auth")}
                            >
                                Sign In
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