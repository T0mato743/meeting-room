import React from 'react';
import {
  Layout,
  Dropdown,
  Card,
  Typography,
  message,
  Menu,
  Button,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import StaffWorkPage from '@/pages/staff/WorkPage';
import '../logo.scss'

const { Header, Sider, Content } = Layout;

const { Text } = Typography;

const StaffLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('已退出登录');
    navigate('/login');
  };

  const userDropdownMenu = [
    {
      key: 'logout',
      label: (
        <Menu>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Menu.Item>
        </Menu>
      )
    }
  ]

  const menuItems = [
    {
      key: '/staff/work',
      icon: <HomeOutlined />,
      label: <Link to="/staff/work">会议室管理</Link>,
    },
    {
      key: '/staff/bookmanagement',
      icon: <CalendarOutlined />,
      label: <Link to="/staff/bookmanagement">预订管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo">
          <div className="logo-icon" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }}>MR</div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      <Layout className="min-h-screen bg-gray-50">
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
          }}
        >
          <Dropdown menu={{ items: userDropdownMenu }} trigger={['click']}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined />
              <span style={{ margin: '0 8px' }}>员工</span>
              <DownOutlined style={{ fontSize: 12 }} />
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>

        <footer className="py-3 text-center bg-white border-t border-gray-200">
          <Text type="secondary" className="text-xs">
            会议室管理系统 &copy; {new Date().getFullYear()} - 员工操作面板
          </Text>
        </footer>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;