import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import User, { IUser } from '../models/User';
import ExcelJS from 'exceljs';
import { UserTaskStats, UserTaskMap } from '../types/user.types';

export const exportTasksReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().populate<{ assignedTo: IUser[] }>('assignedTo', 'name email');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks Report');

    worksheet.columns = [
      { header: 'Task ID', key: '_id', width: 25 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 20 },
      { header: 'Assigned To', key: 'assignedTo', width: 30 },
    ];

    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user: IUser) => `${user.name} (${user.email})`)
        .join(', ');
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split('T')[0],
        assignedTo: assignedTo || 'Unassigned',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="tasks_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const exportUsersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('name email _id').lean();
    const userTasks = await Task.find().populate<{ assignedTo: IUser[] }>('assignedTo', 'name email _id');

    const userTaskMap: UserTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id.toString()] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    userTasks.forEach((task) => {
      if (task.assignedTo) {
        task.assignedTo.forEach((assignedUser: IUser) => {
          const userId = (assignedUser._id as { toString(): string }).toString();
          if (userTaskMap[userId]) {
            userTaskMap[userId].taskCount += 1;
            if (task.status === 'Pending') {
              userTaskMap[userId].pendingTasks += 1;
            } else if (task.status === 'In Progress') {
              userTaskMap[userId].inProgressTasks += 1;
            } else if (task.status === 'Completed') {
              userTaskMap[userId].completedTasks += 1;
            }
          }
        });
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Task Report');

    worksheet.columns = [
      { header: 'User name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
      { header: 'Pending Tasks', key: 'pendingTasks', width: 20 },
      { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
      { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="users_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
}; 