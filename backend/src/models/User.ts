import pool from '../config/db';
import { hashPassword } from '../utils/passwordUtils';

export interface User {
    user_id: number;
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'staff' | 'customer';
    company: string | null;
    phone: string | null;
    status: '正常' | '冻结' | '待审核';
    created_at: Date;
}

export interface CreateUserPayload {
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'staff' | 'customer';
    company?: string | null;
    phone?: string | null;
}

class UserModel {
    async createUser(userData: CreateUserPayload): Promise<User> {
        const hashedPassword = await hashPassword(userData.password);

        const [result] = await pool.execute(
            `INSERT INTO users (username, password, name, role, company, phone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userData.username,
                hashedPassword,
                userData.name,
                userData.role,
                userData.company || null,
                userData.phone || null,
                '待审核'
            ]
        ) as any;

        return {
            user_id: result.insertId,
            username: userData.username,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            company: userData.company || null,
            phone: userData.phone || null,
            status: '待审核',
            created_at: new Date()
        };
    }

    async findByUsername(username: string): Promise<User | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        ) as any;

        return rows[0] ? rows[0] : null;
    }

    async findById(userId: number): Promise<User | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE user_id =?',
            [userId]
        ) as any;

        return rows[0]? rows[0] : null;
    }
}

export default new UserModel();