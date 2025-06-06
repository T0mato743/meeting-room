import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routers/authRouter';
import adminRoutes from './routers/adminRouter';
import bookingRoutes from './routers/bookingRouter';
import equipmentRoutes from './routers/equipmentRouter';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/bookings', bookingRoutes);
app.use('/equipments', equipmentRoutes);

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});