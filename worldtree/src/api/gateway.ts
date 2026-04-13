import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { nodeRouter } from './modules/node';
import { kgRouter } from './modules/kg';
import { agentRouter } from './modules/agent';
import { permRouter } from './modules/perm';
import { resourceRouter } from './modules/resource';
import { ApiResponse, ErrorCode } from '../types/common';

export const gatewayRouter = Router();

// JWT认证中间件
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    const response: ApiResponse = {
      code: ErrorCode.PERMISSION_DENIED,
      msg: '缺少认证令牌',
      data: null
    };
    return res.status(401).json(response);
  }

  try {
    const decoded = jwt.verify(token, process.env.OPENCLAW_JWT_SECRET || 'default_secret');
    (req as any).user = decoded;
    next();
  } catch (err) {
    const response: ApiResponse = {
      code: ErrorCode.PERMISSION_DENIED,
      msg: '无效的认证令牌',
      data: null
    };
    return res.status(401).json(response);
  }
};

// 请求日志中间件
const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

// 统一响应格式化中间件
const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function(data: any) {
    if (data.code !== undefined) {
      return originalJson.call(this, data);
    }
    const response: ApiResponse = {
      code: ErrorCode.SUCCESS,
      msg: 'success',
      data
    };
    return originalJson.call(this, response);
  };
  next();
};

// 全局错误处理中间件
gatewayRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API网关错误:', err);
  const response: ApiResponse = {
    code: ErrorCode.INTERNAL_ERROR,
    msg: '内部服务错误',
    data: null
  };
  res.status(500).json(response);
});

// 注册中间件
gatewayRouter.use(logMiddleware);
gatewayRouter.use(responseMiddleware);
gatewayRouter.use(authMiddleware);

// 注册子路由
gatewayRouter.use('/node', nodeRouter);
gatewayRouter.use('/kg', kgRouter);
gatewayRouter.use('/agent', agentRouter);
gatewayRouter.use('/perm', permRouter);
gatewayRouter.use('/resource', resourceRouter);

export default gatewayRouter;
