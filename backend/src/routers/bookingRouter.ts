import express, { RequestHandler } from 'express';
import {
    findAvailableRooms,
    createBooking,
    payBooking,
    getCustomerBookings,
    cancelBooking,
    getCancellationPolicy
} from '../controllers/bookingController';
import { authenticateJWT, requireCustomer } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateJWT as RequestHandler);

// 获取可用会议室
router.post('/search', requireCustomer as RequestHandler, async (req, res, next) => {
    try {
        await findAvailableRooms(req, res);
    } catch (error) {
        next(error);
    }
});

// 创建预订订单
router.post('/', requireCustomer as RequestHandler, async (req, res, next) => {
    try {
        await createBooking(req, res);
    } catch (error) {
        next(error);
    }
});

// 支付订单
router.post('/:bookingId/pay', requireCustomer as RequestHandler, async (req, res, next) => {
    try {
        await payBooking(req, res);
    } catch (error) {
        next(error);
    }
});

// 获取客户订单列表
router.get('/', async (req, res, next) => {
    try {
        await getCustomerBookings(req, res);
    } catch (error) {
        next(error);
    }
});

// 取消预订
router.post('/:bookingId/cancel', requireCustomer as RequestHandler, async (req, res, next) => {
    try {
        await cancelBooking(req, res);
    } catch (error) {
        next(error);
    }
});

// 获取取消规则
router.get('/cancellation-policy', requireCustomer as RequestHandler, getCancellationPolicy);

export default router;