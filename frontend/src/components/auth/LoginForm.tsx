import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { notification } from '@/utils/notification';

import '@ant-design/v5-patch-for-react-19';
import { Typography, Card as AntCard, message } from 'antd';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [formValues, setFormValues] = useState<LoginFormValues>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormValues>>({});
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const validate = (): boolean => {
    const tempErrors: Partial<LoginFormValues> = {};
    tempErrors.username = formValues.username ? "" : "请输入用户名";
    tempErrors.password = formValues.password ? "" : "请输入密码";
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const { token, ...userData } = await authApi.login(formValues);

        if (userData.status === '待审核') {
          message.warning('您的账号正在审核中，请耐心等待');
        } else if (userData.status === '冻结') {
          message.warning('您的账号已被冻结，请联系管理员');
        }
        login(token, { ...userData, token });
        message.success('登录成功');

        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'customer') {
          navigate('/customer');
        } else {
          navigate('/staff');
        }

      } catch (error) {
        notification.error('登录失败', (error as Error).message || '请检查您的用户名和密码');
      } finally {
        setLoading(false);
      }

    }
  };

  return (
    <AntCard className="auth-form-card">
      <div className="form-header">
        <Title level={3} className="form-title">登录</Title>
        <p className="form-subtitle">请输入您的账号信息</p>
      </div>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          id="username"
          label="用户名"
          name="username"
          autoComplete="username"
          value={formValues.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
          placeholder={"请输入用户名"}
          variant="outlined"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="password"
          label="密码"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formValues.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          placeholder={"请输入密码"}
          variant="outlined"
        />
        <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
          <Button
            type="submit"
            fullWidth
            size="small"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              bgcolor: '$primary-color',
              '&:hover': {
                bgcolor: 'darken($primary-color, 10%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Link component={RouterLink} to="/auth/forgot-password" variant="body2" underline="none">
            忘记密码?
          </Link>
        </Box>
      </Box>

      <div className="form-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
        <span>没有账号? </span>
        <Link component={RouterLink} to="/register" variant="body2" underline="none">
          立即注册
        </Link>
      </div>
    </AntCard>
  );
};

export default LoginForm;