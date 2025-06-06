import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// 注册路由
router.post('/register', async (req, res, next) => {
    try {
        await register(req, res);
    } catch (error) {
        next(error);
    }
});

// 登录路由
router.post('/login', async (req, res, next) => {
    try {
        await login(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;