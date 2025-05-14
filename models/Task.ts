import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITodo {
  text: string;
  completed: boolean;
}

export interface ITask extends Document {
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
}

const todoSchema = new Schema<ITodo>({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    attachments: [{ type: String }],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema); 