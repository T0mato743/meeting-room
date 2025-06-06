import { Request, Response, NextFunction } from 'express';

// 错误处理中间件
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('未处理错误:', err.stack);
  res.status(500).json({ message: '服务器错误' });
};

export default errorHandler;