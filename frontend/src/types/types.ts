// 用户类型
export interface User {
  user_id: number;
  username: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  company?: string;
  phone?: string;
  status: '正常' | '冻结' | '待审核';
  created_at: string;
}

export interface registerData {
  user_id: number;
  username: string;
  name: string;
  password: string
  role: 'admin' | 'staff' | 'customer';
  company?: string;
  phone?: string;
}

// 设备类型
export interface Equipment {
  equipment_id: number;
  name: string;
}

// 会议室类型
export interface MeetingRoom {
  roomId: number;
  room_id: number;
  name: string;
  type: '教室型' | '圆桌型';
  capacity: number;
  price_per_hour: number;
  status: '空闲' | '锁定' | '预定' | '使用' | '维护';
  equipments?: Equipment[];
}

// 预订类型
export interface Booking {
  bookingId: number;
  booking_id: number;
  user_id: number;
  room_id: number;
  room_name?: string;
  room_type?: string;
  user_name?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  payment_status: '未付' | '已付' | '已退款' | '待审核';
  totalAmount: number;
}

// 可用会议室类型
export interface AvailableRoom extends MeetingRoom {
  equipments: Equipment[];
}

// 预订请求类型
export interface BookingRequest {
  startTime: string;
  endTime: string;
  capacity: number;
  equipmentIds?: number[];
}