import { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/Task';
import { IUser } from '../models/User';
import { FilterQuery } from 'mongoose';
import { AppError } from '../types/error.types';
import {
  TaskQuery,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateTaskChecklistRequest,
  TaskWithCompletedCount,
  StatusSummary
} from '../types/task.types';

export const getTasks = async (
  req: Request<{}, {}, {}, TaskQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    let filter: FilterQuery<ITask> = {};
    if (status) {
      filter.status = status;
    }

    let tasks: ITask[];
    if (req.user?.role === 'admin') {
      tasks = await Task.find(filter).populate<{ assignedTo: IUser[] }>('assignedTo', 'name email profileImageUrl');
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user?._id }).populate<{ assignedTo: IUser[] }>(
        'assignedTo',
        'name email profileImageUrl'
      );
    }

    const tasksWithCompletedCount = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter((item) => item.completed).length;
        return { ...task.toObject(), completedTodoCount: completedCount } as TaskWithCompletedCount;
      })
    );

    const allTasks = await Task.countDocuments(
      req.user?.role === 'admin' ? {} : { assignedTo: req.user?._id }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: 'Pending',
      ...(req.user?.role !== 'admin' && { assignedTo: req.user?._id }),
    } as FilterQuery<ITask>);

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: 'In Progress',
      ...(req.user?.role !== 'admin' && { assignedTo: req.user?._id }),
    } as FilterQuery<ITask>);

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: 'Completed',
      ...(req.user?.role !== 'admin' && { assignedTo: req.user?._id }),
    } as FilterQuery<ITask>);

    res.json({
      tasks: tasksWithCompletedCount,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      } as StatusSummary,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (
  req: Request<{}, {}, CreateTaskRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body;

    if (!Array.isArray(assignedTo)) {
      throw new AppError(400, 'assignedTo must be an array of user IDs');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user?._id,
      todoChecklist,
      attachments,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request<{ id: string }, {}, UpdateTaskRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        throw new AppError(400, 'assignedTo must be an array of user IDs');
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    await task.deleteOne();
    res.json({
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (
  req: Request<{ id: string }, {}, UpdateTaskStatusRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const isAssigned = task.assignedTo.some(
      (userId) => (userId as { toString(): string }).toString() === (req.user?._id as { toString(): string }).toString()
    );

    if (!isAssigned && req.user?.role !== 'admin') {
      throw new AppError(403, 'Not authorized');
    }

    task.status = req.body.status || task.status;

    if (task.status === 'Completed') {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({ message: 'Task status updated', task });
  } catch (err) {
    next(err);
  }
};

export const updateTaskChecklist = async (
  req: Request<{ id: string }, {}, UpdateTaskChecklistRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (!task.assignedTo.includes(req.user?._id) && req.user?.role !== 'admin') {
      throw new AppError(403, 'Not authorized to update the checklist');
    }

    task.todoChecklist = todoChecklist;

    const completedCount = task.todoChecklist.filter((item) => item.completed).length;
    const totalItems = task.todoChecklist.length;
    task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (task.progress === 100) {
      task.status = 'Completed';
    } else if (task.progress > 0) {
      task.status = 'In Progress';
    } else {
      task.status = 'Pending';
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');

    res.json({
      message: 'Task checklist updated',
      updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    res.json({
      all: allTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    } as StatusSummary);
  } catch (err) {
    next(err);
  }
};

export const getUserDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allTasks = await Task.countDocuments({ assignedTo: req.user?._id });
    const pendingTasks = await Task.countDocuments({ assignedTo: req.user?._id, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ assignedTo: req.user?._id, status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ assignedTo: req.user?._id, status: 'Completed' });

    res.json({
      all: allTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    } as StatusSummary);
  } catch (err) {
    next(err);
  }
}; 