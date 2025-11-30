import { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Space, Avatar } from 'antd';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HomeOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { getCurrentUser, logout } from '../utils/auth';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;
const { Text } = Typography;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
  ];

  return (
    <AntLayout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              <Text strong style={{ color: 'white', fontSize: 18 }}>
                Python Learning
              </Text>
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
          />
          <div className="header-actions">
            {user ? (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Text style={{ color: 'white' }}>
                  {user.username}
                  {user.isAdmin && <span style={{ marginLeft: 8, color: '#ffd700' }}>👑</span>}
                </Text>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  style={{ color: 'white' }}
                >
                  Logout
                </Button>
              </Space>
            ) : (
              <Space>
                <Button
                  type="text"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  style={{ color: 'white' }}
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Header>
      <Content className="app-content">
        {children}
      </Content>
      <Footer className="app-footer">
        Python Learning Platform ©2024 - Learn Python Programming
      </Footer>
    </AntLayout>
  );
};

export default Layout;

