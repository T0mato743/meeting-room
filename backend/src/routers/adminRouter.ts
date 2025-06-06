import express from 'express';
import { RequestHandler } from 'express';
import {
    createMeetingRoom,
    updateMeetingRoom,
    deleteMeetingRoom,
    listMeetingRooms,
} from '../controllers/meetingRoomController';
import {
    listUsers,
    updateUserStatus,
    deleteUser
} from '../controllers/userController';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateJWT as RequestHandler);

// 会议室管理
router.post('/meeting-rooms', requireAdmin as RequestHandler, async (req, res, next) => {
    try {
        await createMeetingRoom(req, res);
    } catch (error) {
        next(error);
    }
});
router.put('/meeting-rooms/:roomId', async (req, res, next) => {
    try {
        await updateMeetingRoom(req, res);
    } catch (error) {
        next(error);
    }
});
router.delete('/meeting-rooms/:roomId', requireAdmin as RequestHandler, async (req, res, next) => {
    try {
        await deleteMeetingRoom(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/meeting-rooms', listMeetingRooms);

// 用户管理
router.get('/users', requireAdmin as RequestHandler, listUsers);
router.put('/users/:userId/status', requireAdmin as RequestHandler, async (req, res, next) => {
    try {
        await updateUserStatus(req, res);
    } catch (error) {
        next(error);
    }
});
router.delete('/users/:userId', requireAdmin as RequestHandler, async (req, res, next) => {
    try {
        await deleteUser(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;