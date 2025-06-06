import express from 'express';
import { getAllEquipments, createEquipment } from '../controllers/equipmentController';

const router = express.Router();

// 获取所有设备
router.get('/', getAllEquipments);

// 创建设备
router.post('/', async (req, res, next) => {
    try {
        await createEquipment(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;