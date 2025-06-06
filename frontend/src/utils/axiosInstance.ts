import { message } from 'antd';
import axios from 'axios';

const API_URL = import.meta.env.REACT_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('未授权，请重新登录');
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data.message || '请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;