export interface RegisterRequest {
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'staff' | 'customer';
    company?: string;    // 仅对客户可选
    phone?: string;      // 仅对客户可选
    status: '待审核';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface UserResponse {
    userId: number;
    username: string;
    name: string;
    role: string;
    status: string;
    token: string;
}