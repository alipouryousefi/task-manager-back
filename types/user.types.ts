export interface UserWithTaskCounts {
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

export interface UserTaskStats {
  name: string;
  email: string;
  taskCount: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface UserTaskMap {
  [key: string]: UserTaskStats;
} 