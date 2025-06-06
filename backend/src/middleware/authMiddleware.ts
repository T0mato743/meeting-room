import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

// JWT认证中间件
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: '未提供认证令牌' });
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ message: '无效的认证令牌' });
            return;
        }

        try {
            const [user] = await pool.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [decoded.userId]
            ) as any;

            if (user.length === 0) {
                res.status(404).json({ message: '用户不存在' });
                return;
            }

            if (user[0].status !== '正常') {
                res.status(403).json({ message: '账号状态异常' });
                return;
            }

            // 将用户信息附加到请求对象
            (req as any).user = {
                userId: user[0].user_id,
                username: user[0].username,
                role: user[0].role
            };

            next();
        } catch (error) {
            console.error('用户验证错误:', error);
            res.status(500).json({ message: '服务器错误' });
        }
    });
};

// 管理员权限中间件
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};

// 客户权限中间件
export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role !== 'customer') {
        return res.status(403).json({ message: '需要客户权限' });
    }
    next();
};

// 员工权限中间件
export const requirestaff = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role!== 'staff') {
        return res.status(403).json({ message: '需要员工权限' });
    }
    next();
};