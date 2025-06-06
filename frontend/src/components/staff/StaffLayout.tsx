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
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffWorkPage from '@/pages/staff/WorkPage';

const { Header, Content } = Layout;
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

  return (
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

      <Content className="p-4">
        <Card className="min-h-[calc(100vh-100px)] bg-white shadow-sm">
          <StaffWorkPage />
        </Card>
      </Content>

      <footer className="py-3 text-center bg-white border-t border-gray-200">
        <Text type="secondary" className="text-xs">
          会议室管理系统 &copy; {new Date().getFullYear()} - 员工操作面板
        </Text>
      </footer>
    </Layout>
  );
};

export default StaffLayout;