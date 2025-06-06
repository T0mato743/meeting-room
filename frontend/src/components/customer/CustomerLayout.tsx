import React from 'react';
import { Button, Dropdown, Layout, Menu } from 'antd';
import {
  BookOutlined,
  DownOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../logo.scss'

const { Header, Sider, Content } = Layout;

const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('useData')
    navigate('/login')
  }

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
      key: '/customer/book',
      icon: <BookOutlined />,
      label: <Link to="/customer/book">预订会议室</Link>,
    },
    {
      key: '/customer/my-bookings',
      icon: <UnorderedListOutlined />,
      label: <Link to="/customer/my-bookings">我的订单</Link>,
    }
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
      <Layout>
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
              <span style={{ margin: '0 8px' }}>客户</span>
              <DownOutlined style={{ fontSize: 12 }} />
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomerLayout;