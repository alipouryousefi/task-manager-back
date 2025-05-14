import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import User, { IUser } from '../models/User';
import { UserWithTaskCounts } from '../types/user.types';
import { AppError } from '../types/error.types';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find({ role: 'member' }).select('-password');

    const userWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTask = await Task.countDocuments({
          assignedTo: user._id,
          status: 'Pending',
        });

        const inProgressTask = await Task.countDocuments({
          assignedTo: user._id,
          status: 'In Progress',
        });

        const completedTask = await Task.countDocuments({
          assignedTo: user._id,
          status: 'Completed',
        });

        return {
          ...user.toObject(),
          pendingTask,
          inProgressTask,
          completedTask,
        } satisfies UserWithTaskCounts;
      })
    );

    res.json(userWithTaskCounts);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}; 