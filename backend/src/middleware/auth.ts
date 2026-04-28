import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}
