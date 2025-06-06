import { Request, Response } from 'express';
import pool from '../config/db';

export const listUsers = async (req: Request, res: Response) => {
    try {
        const { role, status, page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const offset = (pageNumber - 1) * limitNumber;

        let query = `SELECT user_id, username, name, role, company, phone, status, created_at 
                     FROM users WHERE 1=1`;
        const params: any[] = [];

        if (role) {
            query += ` AND role = ?`;
            params.push(role);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        // 获取总数用于分页
        const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS count_table`;
        const [countResult] = await pool.execute(countQuery, params) as any;
        const total = countResult[0].total;

        // 添加分页
        query += ` LIMIT ${limitNumber} OFFSET ${offset}`;

        const [users] = await pool.execute(query, params) as any;

        res.status(200).json({
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: users
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const { status } = req.body;

        const validStatuses = ['待审核', '正常', '冻结'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: '无效的状态值' });
        }

        const [userRows] = await pool.execute(
            `SELECT * FROM users WHERE user_id = ?`,
            [userId]
        ) as any;

        if (userRows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 更新用户状态
        await pool.execute(
            `UPDATE users SET status = ? WHERE user_id = ?`,
            [status, userId]
        );

        res.status(200).json({ message: '用户状态更新成功' });
    } catch (error) {
        console.error('更新用户状态错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);

        const [userRows] = await pool.execute(
            `SELECT * FROM users WHERE user_id = ?`,
            [userId]
        ) as any;

        if (userRows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 删除用户
        await pool.execute(
            `DELETE FROM users WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({ message: '用户删除成功' });
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};