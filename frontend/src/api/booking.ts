import { message } from 'antd';
import type { Booking, AvailableRoom, BookingRequest } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

export const bookingApi = {
  // 查找可用会议室
  findAvailableRooms: async (data: BookingRequest): Promise<AvailableRoom[]> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/bookings/search`, data);
      return response.data;
    } catch (error) {
      message.error('查询可用会议室失败');
      throw error;
    }
  },

  // 创建预订
  createBooking: async (data: {
    roomId: number;
    startTime: string;
    endTime: string;
  }): Promise<Booking> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/bookings`, data);
      message.success('预订创建成功，请在30分钟内完成支付');
      return response.data;
    } catch (error) {
      message.error('创建预订失败');
      throw error;
    }
  },

  // 支付订单
  payBooking: async (bookingId: number): Promise<void> => {
    try {
      await axiosInstance.post(`${API_URL}/bookings/${bookingId}/pay`);
      message.success('支付成功');
    } catch (error) {
      message.error('支付失败');
      throw error;
    }
  },

  // 获取用户订单
  getCustomerBookings: async (params: { status?: string, startTime?: string, endTime?: string }): Promise<Booking[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/bookings`, { params });
      return response.data;
    } catch (error) {
      message.error('获取订单列表失败');
      throw error;
    }
  },

  // 取消预订
  cancelBooking: async (bookingId: number): Promise<{ refundAmount: number }> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/bookings/${bookingId}/cancel`);
      message.success('取消申请已提交，等待退款');
      return response.data;
    } catch (error) {
      message.error('取消预订失败');
      throw error;
    }
  },

  // 获取取消规则
  getCancellationPolicy: async (token: string): Promise<{
    timeBeforeStart: number;
    refundPercentage: number;
  }> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/bookings/cancellation-policy`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      message.error('获取取消规则失败');
      throw error;
    }
  },

  updateBooking: async (
    bookingId: number,

    payment_status: '未付' | '已付' | '已退款' | '待审核',
  ): Promise<Booking> => {
    try {
      const response = await axiosInstance.put(`${API_URL}/bookings/${bookingId}/update`, { payment_status });
      message.success('订单更新成功')
      return response.data;
    } catch (error) {
      message.error('更新订单失败');
      throw error;
    }
  }
};