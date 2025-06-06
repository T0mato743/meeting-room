import { message } from 'antd';
import type { Equipment, MeetingRoom } from '@/types/types';
import axiosInstance from '@/utils/axiosInstance';


const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

export const meetingRoomApi = {
  // 创建会议室
  createMeetingRoom: async (data: {
    name: string;
    type: '教室型' | '圆桌型';
    capacity: number;
    price_per_hour: number;
    equipments: number[];
  }): Promise<MeetingRoom> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/admin/meeting-rooms`, data);
      message.success('会议室创建成功');
      return response.data;
    } catch (error) {
      message.error('创建会议室失败');
      throw error;
    }
  },

  // 更新会议室
  updateMeetingRoom: async (
    roomId: number,
    data: {
      name?: string;
      type?: '教室型' | '圆桌型';
      capacity?: number;
      price_per_hour?: number;
      status?: '空闲' | '锁定' | '预定' | '使用' | '维护';
      equipments?: number[];
    }
  ): Promise<MeetingRoom> => {
    try {
      const response = await axiosInstance.put(`${API_URL}/admin/meeting-rooms/${roomId}`, data);
      message.success('会议室更新成功');
      return response.data;
    } catch (error) {
      message.error('更新会议室失败');
      throw error;
    }
  },

  // 删除会议室
  deleteMeetingRoom: async (roomId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/admin/meeting-rooms/${roomId}`);
      message.success('会议室删除成功');
    } catch (error) {
      message.error('删除会议室失败');
      throw error;
    }
  },

  // 获取会议室列表
  listMeetingRooms: async (params?: {
    name: string;
    status?: string;
    type?: string;
    minCapacity?: number;
    maxCapacity?: number;
  }): Promise<MeetingRoom[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/admin/meeting-rooms`, { params });
      return response.data;
    } catch (error) {
      message.error('获取会议室列表失败');
      throw error;
    }
  },

  // 获取所有设备
  getAllEquipments: async (params?: {
    name: string;
    equipment_id: number;
  }): Promise<Equipment[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/equipments/`, { params });
      return response.data;
    } catch (error) {
      message.error('获取设备列表失败');
      throw error;
    }
  },

  // 新建设备
  createEquipment: async (data: {
    name: string
  }): Promise<Equipment[]> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/equipments/`, data)
      message.success('设备创建成功');
      return response.data;
    } catch (error) {
      message.error('创建设备失败');
      throw error;
    }
  }
};