import { message } from 'antd';
import axiosInstance from '@/utils/axiosInstance';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

interface RegisterData {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  company?: string;
  phone?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  userId: number;
  username: string;
  name: string;
  role: string;
  status: string;
  token: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/auth/register`, data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      message.error("注册失败");
      console.error(error);
      throw error;
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/auth/login`, data);
      localStorage.setItem('token', response.data.token);
      console.log(response.data.token);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};