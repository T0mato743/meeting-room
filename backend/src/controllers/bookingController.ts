import { Request, Response } from 'express';
import { safeExecute } from '../utils/dbUtils';
import { Booking } from '../types/Booking.interface';

// 提交预约要求 - 查询可用会议室
export const findAvailableRooms = async (req: Request, res: Response) => {
    try {
        const { startTime, endTime, capacity, equipmentIds } = req.body;

        if (!startTime || !endTime || !capacity) {
            return res.status(400).json({ message: '缺少必填字段: 开始时间、结束时间、参会人数' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const minCapacity = Number(capacity);

        if (start >= end) {
            return res.status(400).json({ message: '结束时间必须晚于开始时间' });
        }

        // 验证提前预订时间 (24小时-60天)
        const now = new Date();
        const minStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后
        const maxStartTime = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60天后

        if (start < minStartTime) {
            return res.status(400).json({ message: '预订必须提前至少24小时' });
        }

        if (start > maxStartTime) {
            return res.status(400).json({ message: '预订不能超过60天' });
        }

        // 构建查询条件
        let query = `
            SELECT mr.* 
            FROM meeting_rooms mr
            WHERE mr.status = '空闲'
            AND mr.capacity >= ?
            AND NOT EXISTS (
                SELECT 1 
                FROM bookings b 
                WHERE b.room_id = mr.room_id 
                AND b.payment_status != '已退款'
                AND (
                    (b.start_time < ? AND b.end_time > ?) 
                    OR (b.start_time < ? AND b.end_time > ?)
                    OR (b.start_time >= ? AND b.end_time <= ?)
                )
            )
        `;
        const params: any[] = [minCapacity, end, start, end, start, start, end];

        // 添加设备条件
        if (equipmentIds && equipmentIds.length > 0) {
            query += `
                AND mr.room_id IN (
                    SELECT re.room_id
                    FROM room_equipments re
                    WHERE re.equipment_id IN (${equipmentIds.map(() => '?').join(',')})
                    GROUP BY re.room_id
                    HAVING COUNT(DISTINCT re.equipment_id) = ?
                )
            `;
            params.push(...equipmentIds, equipmentIds.length);
        }

        // 执行查询
        const rooms = await safeExecute(query, params) as any[];

        // 获取每个会议室的设备信息
        for (const room of rooms) {
            const equipments = await safeExecute(
                `SELECT e.* 
                 FROM equipments e
                 JOIN room_equipments re ON e.equipment_id = re.equipment_id
                 WHERE re.room_id = ?`,
                [room.room_id]
            ) as any[];
            room.equipments = equipments;
        }

        res.status(200).json(rooms);
    } catch (error) {
        console.error('查询可用会议室错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 生成订单
export const createBooking = async (req: Request, res: Response) => {
    try {
        const { roomId, startTime, endTime } = req.body;
        const userId = (req as any).user.userId;

        if (!roomId || !startTime || !endTime) {
            return res.status(400).json({ message: '缺少必填字段: 会议室ID、开始时间、结束时间' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        // 验证会议室是否存在且空闲
        const [room] = await safeExecute(
            `SELECT * FROM meeting_rooms WHERE room_id = ?`,
            [roomId]
        ) as any[];

        if (!room || room.length === 0) {
            return res.status(404).json({ message: '会议室不存在' });
        }

        if (room.status !== '空闲') {
            return res.status(400).json({ message: '会议室当前不可用' });
        }

        const [existingBookings] = await safeExecute(
            `SELECT * 
             FROM bookings 
             WHERE room_id = ? 
             AND payment_status != '已退款'
             AND (
                 (start_time < ? AND end_time > ?) 
                 OR (start_time < ? AND end_time > ?)
                 OR (start_time >= ? AND end_time <= ?)
             )`,
            [roomId, end, start, end, start, start, end]
        ) as any[];

        if (existingBookings && existingBookings.length > 0) {
            return res.status(400).json({ message: '该时间段已被预订' });
        }

        // 计算租赁时长和总金额
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const totalAmount = room.price_per_hour * hours;

        // 创建订单
        const bookingResult = await safeExecute(
            `INSERT INTO bookings (user_id, room_id, start_time, end_time, total_amount)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, roomId, start, end, totalAmount]
        ) as any;

        const bookingId = bookingResult.insertId;

        // 锁定会议室
        await safeExecute(
            `UPDATE meeting_rooms SET status = '锁定' WHERE room_id = ?`,
            [roomId]
        );

        res.status(201).json({
            bookingId,
            message: '订单创建成功，请在30分钟内完成支付',
            totalAmount,
            start,
            end,
            paymentDeadline: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后
        });
    } catch (error) {
        console.error('创建预订错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 支付订单
export const payBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const userId = (req as any).user.userId;

        // 获取订单
        const [bookings] = await safeExecute(
            `SELECT * 
             FROM bookings 
             WHERE booking_id = ? 
             AND user_id = ?`,
            [bookingId, userId]
        ) as any[];

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: '订单不存在' });
        }

        // 检查订单状态
        if (bookings.payment_status !== '未付') {
            return res.status(400).json({ message: '订单已支付或已退款' });
        }

        // 检查支付时间（30分钟内）
        const createdTime = new Date(bookings.created_at);
        const now = new Date();
        const timeDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60); // 分钟

        if (timeDiff > 30) {
            // 自动取消订单
            await safeExecute(
                `UPDATE bookings SET payment_status = '已退款' WHERE booking_id = ?`,
                [bookingId]
            );
            await safeExecute(
                `UPDATE meeting_rooms SET status = '空闲' WHERE room_id = ?`,
                [bookings.room_id]
            );
            return res.status(400).json({ message: '支付超时，订单已自动取消' });
        }

        // 更新订单状态为已支付
        await safeExecute(
            `UPDATE bookings 
             SET payment_status = '已付' 
             WHERE booking_id = ?`,
            [bookingId]
        );

        // 更新会议室状态为预定
        await safeExecute(
            `UPDATE meeting_rooms 
             SET status = '预定' 
             WHERE room_id = ?`,
            [bookings.room_id]
        );

        res.status(200).json({ message: '支付成功' });
    } catch (error) {
        console.error('支付订单错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取客户订单列表
export const getCustomerBookings = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { status, startTime, endTime } = req.query;

        let query = `
            SELECT 
                b.booking_id, b.start_time, b.end_time, b.total_amount, b.payment_status, 
                b.created_at,
                mr.name AS room_name, mr.type AS room_type, mr.capacity, mr.price_per_hour,
                u.username AS customer_name
            FROM bookings b
            JOIN meeting_rooms mr ON b.room_id = mr.room_id
            JOIN users u ON b.user_id = u.user_id
        `;

        const params: any[] = [];
        const conditions: string[] = [];

        // 对于客户，只返回他们自己的订单
        if (user.role === 'customer') {
            conditions.push('b.user_id = ?');
            params.push(user.userId);
        }

        if (status) {
            conditions.push('b.payment_status = ?');
            params.push(status);
        }

        if (startTime && endTime) {
            conditions.push('(DATE(b.start_time) BETWEEN ? AND ?)');
            params.push(startTime, endTime);
        }



        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY b.created_at DESC`;
        console.log(req.params);
        const bookings = await safeExecute(query, params) as any[];
        res.status(200).json(bookings);
    } catch (error) {
        console.error('获取订单列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 取消预订
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const userId = (req as any).user.userId;

        // 获取订单
        const [bookings] = await safeExecute(
            `SELECT * 
             FROM bookings 
             WHERE booking_id = ? 
             AND user_id = ?`,
            [bookingId, userId]
        ) as any[];

        if (bookings.length === 0) {
            return res.status(404).json({ message: '订单不存在' });
        }

        const booking = bookings;
        // 检查订单状态
        if (booking.payment_status !== '已付') {
            return res.status(400).json({ message: '只有已支付的订单才能取消' });
        }

        // 检查取消时间（提前24小时）
        const startTime = new Date(booking.start_time);
        const now = new Date();
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60); // 小时

        if (timeDiff < 24) {
            return res.status(400).json({ message: '必须提前至少24小时取消预订' });
        }

        // 计算退款金额
        let refundRate = 0;
        if (timeDiff >= 72) {
            refundRate = 1.0; // 100%
        } else if (timeDiff >= 48) {
            refundRate = 0.75; // 75%
        } else if (timeDiff >= 24) {
            refundRate = 0.25; // 25%
        }

        const refundAmount = booking.total_amount * refundRate;

        // 创建取消申请
        const cancellationResult = await safeExecute(
            `INSERT INTO cancellations (booking_id, refund_amount)
                 VALUES (?, ?)`,
            [bookingId, refundAmount]
        ) as any;

        // 更新订单状态为待退款
        await safeExecute(
            `UPDATE bookings 
                 SET payment_status = '已退款' 
                 WHERE booking_id = ?`,
            [bookingId]
        );

        res.status(201).json({
            cancellationId: cancellationResult.insertId,
            message: '取消申请已提交，等待退款',
            refundAmount
        });
    } catch (error) {
        console.error('取消预订错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取取消规则
export const getCancellationPolicy = async (req: Request, res: Response) => {
    res.status(200).json({
        policy: [
            { hoursBefore: 72, refundRate: 100, description: '提前72小时以上取消，退款100%' },
            { hoursBefore: 48, refundRate: 75, description: '提前48-72小时取消，退款75%' },
            { hoursBefore: 24, refundRate: 25, description: '提前24-48小时取消，退款25%' },
            { hoursBefore: 0, refundRate: 0, description: '24小时内取消，不予退款' }
        ]
    });
};