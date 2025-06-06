import { message } from 'antd';
import type { User } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';


const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

export const userApi = {
  // 获取用户列表
  listUsers: async (params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; data: User[] }> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/users`, { params });
      return response.data;
    } catch (error) {
      message.error('获取用户列表失败');
      throw error;
    }
  },

  // 更新用户状态
  updateUserStatus: async (userId: number, status: string): Promise<void> => {
    try {
      await axiosInstance.put(`${API_URL}/admin/users/${userId}/status`, { status });
      message.success('用户状态更新成功');
    } catch (error) {
      message.error('更新用户状态失败');
      throw error;
    }
  },

  // 删除用户
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/admin/users/${userId}`);
      message.success('用户删除成功');
    } catch (error) {
      message.error('删除用户失败');
      throw error;
    }
  },
};