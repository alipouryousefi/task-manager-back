import { IUser } from '../models/User';

export interface ITodo {
  text: string;
  completed: boolean;
}

export interface TaskQuery {
  status?: 'Pending' | 'In Progress' | 'Completed';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  assignedTo: string[];
  attachments?: string[];
  todoChecklist?: ITodo[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
  assignedTo?: string[];
  attachments?: string[];
  todoChecklist?: ITodo[];
}

export interface UpdateTaskStatusRequest {
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface UpdateTaskChecklistRequest {
  todoChecklist: ITodo[];
}

export interface TaskWithCompletedCount {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: Date;
  assignedTo: IUser['_id'][];
  createdBy: IUser['_id'];
  attachments: string[];
  todoChecklist: ITodo[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedTodoCount: number;
}

export interface StatusSummary {
  all: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
} 