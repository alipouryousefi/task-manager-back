import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  adminInviteToken?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
};

export const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        message: 'User already exists',
      });
      return;
    }

    let role: 'admin' | 'member' = 'member';
    if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      role = 'admin';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken((user._id as { toString(): string }).toString()),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken((user._id as { toString(): string }).toString()),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const updateUserProfile = async (req: Request<{}, {}, UpdateProfileRequest>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken((updatedUser._id as { toString(): string }).toString()),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
}; 