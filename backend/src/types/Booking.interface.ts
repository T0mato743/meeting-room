export interface Booking {
    booking_id: number;
    user_id: number;
    room_id: number;
    start_time: Date;
    end_time: Date;
    created_at: Date;
    payment_status: '未付' | '已付' | '已退款';
    total_amount: number;
}

export interface AvailableRoom {
    room_id: number;
    name: string;
    type: string;
    capacity: number;
    price_per_hour: number;
    status: string;
    equipments: Equipment[];
}

export interface Equipment {
    equipment_id: number;
    name: string;
}

export interface BookingRequest {
    startTime: string;
    endTime: string;
    capacity: number;
    equipmentIds?: number[];
}

export interface BookingResponse {
    bookingId: number;
    message: string;
    totalAmount: number;
    paymentDeadline: Date;
}