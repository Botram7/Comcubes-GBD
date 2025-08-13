import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../authService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

// Middleware to verify JWT token and set req.user
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// Optional authentication middleware (doesn't require token but sets user if present)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = AuthService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

// Extend session type
declare module 'express-session' {
  interface SessionData {
    sessionId: string;
  }
}

// Generate or get session ID for anonymous users
export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.sessionId) {
    req.session.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
};