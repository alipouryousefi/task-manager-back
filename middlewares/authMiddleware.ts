import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import '../types/express.types';
import { AppError } from '../types/error.types';

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
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {
      throw new AppError(401, 'Not authorized, no token');
    }

    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AppError(401, 'Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
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
    next(new AppError(403, 'Access denied, admin only'));
  }
}; 