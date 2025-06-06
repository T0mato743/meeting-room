import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { notification } from '@/utils/notification';
import type { registerData } from '@/types/types'

import { Typography, Card as AntCard } from 'antd';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

const { Title } = Typography;

interface RegisterFormValues {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'staff' | 'customer' | '' | '请选择您的角色';
  company?: string;
  phone?: string;
}

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: '',
    company: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormValues>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<RegisterFormValues['role']>) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name!]: value,
    });
  };

  const validate = (): boolean => {
    const tempErrors: Partial<RegisterFormValues> = {};
    tempErrors.username = formValues.username ? "" : "请输入用户名";
    tempErrors.name = formValues.name ? "" : "请输入姓名";
    tempErrors.password = formValues.password.length >= 6 ? "" : "密码长度至少为6位";
    tempErrors.confirmPassword = formValues.confirmPassword === formValues.password ? "" : "两次输入的密码不一致";
    tempErrors.role = formValues.role ? "" : "请选择您的角色";
    if (formValues.role === 'customer') {
      tempErrors.company = formValues.company ? "" : "请输入公司名称";
      tempErrors.phone = /^1[3-9]\d{9}$/.test(formValues.phone || '') ? "" : "请输入有效的手机号码";
    }
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const { confirmPassword, ...registerData } = formValues;
        await authApi.register(registerData as registerData);
        notification.success('注册成功', '账号已创建，请登录使用');
        navigate('/login');
      } catch (error) {
        notification.error('注册失败', (error as Error).message || '请检查您的输入信息');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AntCard className="auth-form-card">
      <div className="form-header">
        <Title level={3} className="form-title">创建账号</Title>
        <p className="form-subtitle">请填写以下信息完成注册</p>
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
          id="name"
          label="姓名"
          name="name"
          autoComplete="name"
          value={formValues.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          placeholder={"请输入姓名"}
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
          autoComplete="new-password"
          value={formValues.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          placeholder={"请输入密码"}
          variant="outlined"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          size="small"
          name="confirmPassword"
          label="确认密码"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formValues.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          placeholder={"请确认密码"}
          variant="outlined"
        />
        <FormControl fullWidth margin="normal" required error={!!errors.role} size="small">
          <InputLabel id="role-select-label">角色</InputLabel>
          <Select
            labelId="role-select-label"
            id="role"
            name="role"
            value={formValues.role}
            label="角色"
            onChange={handleChange}
          >
            <MenuItem value="customer">客户</MenuItem>
            <MenuItem value="staff">员工</MenuItem>
          </Select>
          {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
        </FormControl>

        {formValues.role === 'customer' && (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              size="small"
              id="company"
              label="公司名称"
              name="company"
              autoComplete="organization"
              value={formValues.company}
              onChange={handleChange}
              error={!!errors.company}
              helperText={errors.company}
              placeholder={"请输入公司名称"}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              size="small"
              id="phone"
              label="手机号码"
              name="phone"
              autoComplete="tel"
              value={formValues.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder={"请输入手机号码"}
              variant="outlined"
            />
          </>
        )}

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
            {loading ? <CircularProgress size={24} color="inherit" /> : '注册'}
          </Button>
        </Box>
      </Box>

      <div className="form-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
        <span>已有账号? </span>
        <Link component={RouterLink} to="/login" variant="body2" underline="none">
          立即登录
        </Link>
      </div>
    </AntCard>
  );
};

export default RegisterForm;