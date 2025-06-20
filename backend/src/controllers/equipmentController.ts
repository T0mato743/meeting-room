import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllEquipments = async (req: Request, res: Response) => {
    try {
        const [equipments] = await pool.execute(
            'SELECT * FROM equipments'
        ) as any;
        
        res.status(200).json(equipments);
    } catch (error) {
        console.error('获取设备列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

export const createEquipment = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: '缺少必填字段' });
        }

        const [equipmentResult] = await pool.execute(
            `INSERT INTO equipments (name) 
            VALUES (?)`,
            [name]
        ) as any;

        const equipmentId = equipmentResult.insertId;

        res.status(201).json({
            message: '设备创建成功',
            equipmentId
        });
    }catch (error) {
        console.error('创建设备错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

export const deleteEquipment = async (req: Request, res: Response) => {
    try {
        const equipmentId = parseInt(req.params.equipmentId);

        const [equipmentRows] = await pool.execute(
            `SELECT * FROM equipments WHERE equipment_id = ?`,
            [equipmentId]
        ) as any;

        if (equipmentRows.length === 0) {
            return res.status(404).json({ message: '设备不存在' });
        }

        // 删除设备
        await pool.execute(
            `DELETE FROM equipments WHERE equipment_id = ?`,
            [equipmentId]
        );

        res.status(200).json({ message: '设备删除成功' });
    } catch (error) {
        console.error('删除设备错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};