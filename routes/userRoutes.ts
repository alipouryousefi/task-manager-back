import express, { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { getUserById, getUsers } from '../controllers/userController';

const router: Router = express.Router();

router.get('/', protect, adminOnly, getUsers); // get all users
router.get('/:id', protect, getUserById);

export default router; 