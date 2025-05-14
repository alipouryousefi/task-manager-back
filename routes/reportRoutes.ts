import express, { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { exportUsersReport, exportTasksReport } from '../controllers/reportController';

const router: Router = express.Router();

router.get('/export/tasks', protect, adminOnly, exportTasksReport);
router.get('/export/user', protect, adminOnly, exportUsersReport);

export default router; 