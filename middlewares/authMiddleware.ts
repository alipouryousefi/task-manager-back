import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(req.headers);
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } else {
      res.status(401).json({
        message: 'Not authorized',
      });
    }
  } catch (err) {
    res.status(401).json({
      message: 'Not authorized',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}; 