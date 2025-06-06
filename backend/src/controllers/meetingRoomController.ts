import { Request, Response } from 'express';
import pool from '../config/db';

export const createMeetingRoom = async (req: Request, res: Response) => {
    try {
        const { name, type, capacity, price_per_hour, equipments } = req.body;

        // 验证必填字段
        if (!name || !type || !capacity || !price_per_hour) {
            return res.status(400).json({ message: '缺少必填字段' });
        }

        // 创建会议室
        const [roomResult] = await pool.execute(
            `INSERT INTO meeting_rooms (name, type, capacity, price_per_hour) 
             VALUES (?, ?, ?, ?)`,
            [name, type, capacity, price_per_hour]
        ) as any;

        const roomId = roomResult.insertId;

        // 添加设备关联
        if (equipments && equipments.length > 0) {
            for (const equipmentId of equipments) {
                await pool.execute(
                    `INSERT INTO room_equipments (room_id, equipment_id) 
                     VALUES (?, ?)`,
                    [roomId, equipmentId]
                );
            }
        }

        res.status(201).json({
            message: '会议室创建成功',
            roomId
        });
    } catch (error) {
        console.error('创建会议室错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const updateMeetingRoom = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const { name, type, capacity, price_per_hour, status, equipments } = req.body;

        // 验证会议室是否存在
        const [roomRows] = await pool.execute(
            `SELECT * FROM meeting_rooms WHERE room_id = ?`,
            [roomId]
        ) as any;

        if (roomRows.length === 0) {
            return res.status(404).json({ message: '会议室不存在' });
        }

        // 更新会议室信息
        await pool.execute(
            `UPDATE meeting_rooms 
             SET name = ?, type = ?, capacity = ?, price_per_hour = ?, status = ?
             WHERE room_id = ?`,
            [name || roomRows[0].name,
            type || roomRows[0].type,
            capacity || roomRows[0].capacity,
            price_per_hour || roomRows[0].price_per_hour,
            status || roomRows[0].status,
                roomId]
        );

        // 更新设备关联
        if (equipments) {
            // 删除原有设备
            await pool.execute(
                `DELETE FROM room_equipments WHERE room_id = ?`,
                [roomId]
            );

            // 添加新设备
            if (equipments.length > 0) {
                for (const equipmentId of equipments) {
                    await pool.execute(
                        `INSERT INTO room_equipments (room_id, equipment_id) 
                         VALUES (?, ?)`,
                        [roomId, equipmentId]
                    );
                }
            }
        }

        res.status(200).json({ message: '会议室更新成功' });
    } catch (error) {
        console.error('更新会议室错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const deleteMeetingRoom = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.roomId);

        const [roomRows] = await pool.execute(
            `SELECT * FROM meeting_rooms WHERE room_id = ?`,
            [roomId]
        ) as any;

        if (roomRows.length === 0) {
            return res.status(404).json({ message: '会议室不存在' });
        }

        // 删除会议室
        await pool.execute(
            `DELETE FROM meeting_rooms WHERE room_id = ?`,
            [roomId]
        );

        res.status(200).json({ message: '会议室删除成功' });
    } catch (error) {
        console.error('删除会议室错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const listMeetingRooms = async (req: Request, res: Response) => {
    try {
        const { status, type, minCapacity, maxCapacity } = req.query;

        let query = `SELECT * FROM meeting_rooms WHERE 1=1`;
        const params = [];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }

        if (minCapacity) {
            query += ` AND capacity >= ?`;
            params.push(minCapacity);
        }

        if (maxCapacity) {
            query += ` AND capacity <= ?`;
            params.push(maxCapacity);
        }

        const [rooms] = await pool.execute(query, params) as any;

        // 获取每个会议室的设备
        for (const room of rooms) {
            const [equipments] = await pool.execute(
                `SELECT e.* 
                 FROM equipments e
                 JOIN room_equipments re ON e.equipment_id = re.equipment_id
                 WHERE re.room_id = ?`,
                [room.room_id]
            ) as any;

            room.equipments = equipments;
        }

        res.status(200).json(rooms);
    } catch (error) {
        console.error('获取会议室列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};