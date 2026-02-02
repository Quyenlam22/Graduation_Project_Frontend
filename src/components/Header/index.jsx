import { Button, Image, Input } from "antd";
import Notice from "../../components/Notice";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import logo from "../../assets/images/logo.png";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthProvider";
import { changeStatus } from "../../services/authService";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../../firebase/config";

function HeaderClient (props) {
  const { setCollapse, collapse } = props;
  const user = useContext(AuthContext);
  const navigate = useNavigate();

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
                  <div className="header-client__search">
                      <Input 
                        placeholder="Search for songs, artists, albums..." 
                        prefix={<SearchOutlined style={{ color: '#fff' }} />} 
                        variant="filled" // Kiểu đổ nền xám nhẹ giống ZingMP3
                        style={{ 
                          borderRadius: '20px', 
                          width: '400px',
                          backgroundColor: '#2F2739',
                          border: 'none',
                          color: "#fff"
                        }} 
                      />
                  </div>
              </div>
              <div className="header-client__nav-right">
                  <div className="header-client__nav-right__notify">
                      <Notice />
                  </div>
                  <div className="header-client__nav-right__auth">
                    <Button 
                        icon={<UserOutlined />} 
                        style={{borderRadius: "50%", marginRight: "10px"}}
                        onClick={() => {navigate("/user-info")}}
                    />
                    <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>Logout</Button>
                  </div>
              </div>
          </div>
        </header>
      </>
  )
}

export default HeaderClient;