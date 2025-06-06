import { Request, Response } from 'express';
import UserModel from '../models/User';
import { verifyPassword } from '../utils/passwordUtils';
import { generateToken } from '../utils/jwtUtils';
import { RegisterRequest, LoginRequest, UserResponse } from '../types/Auth.interface';

// 用户注册
export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, name, role, company, phone }: RegisterRequest = req.body;

        if (!username || !password || !name || !role) {
            return res.status(400).json({ message: '缺少必填字段' });
        }

        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: '用户名已被使用' });
        }

        // 创建新用户
        const user = await UserModel.createUser({
            username,
            password,
            name,
            role,
            company,
            phone,
        });

        const token = generateToken({
            userId: user.user_id,
            username: user.username,
            role: user.role,
            status: user.status,
        });

        const response: UserResponse = {
            userId: user.user_id,
            username: user.username,
            name: user.name,
            role: user.role,
            status: user.status,
            token
        };
        
        res.status(201).json(response);
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password }: LoginRequest = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 查找用户
        const user = await UserModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        if (user.status === '待审核') {
            return res.status(403).json({ message: '账号待审核' });
        }

        if (user.status === '冻结') {
            return res.status(403).json({ message: '账号已冻结' });
        }

        const token = generateToken({
            userId: user.user_id,
            username: user.username,
            role: user.role,
            status: user.status,
        });

        const response: UserResponse = {
            userId: user.user_id,
            username: user.username,
            name: user.name,
            role: user.role,
            status: user.status,
            token
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};