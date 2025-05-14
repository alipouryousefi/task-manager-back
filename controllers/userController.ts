import { Request, Response } from 'express';
import Task from '../models/Task';
import User, { IUser } from '../models/User';

interface UserWithTaskCounts {
  _id: unknown;
  name: string;
  email: string;
  profileImageUrl: string | null;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
  pendingTask: number;
  inProgressTask: number;
  completedTask: number;
  [key: string]: unknown;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({
      message: 'Server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}; 