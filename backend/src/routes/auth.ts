import { Router, Response } from 'express';
import { sql } from '../database/connection';
import { hashPassword, verifyPassword } from '../utils/auth';
import { generateToken } from '../utils/jwt';
import { AuthRequest, RegisterRequest, User } from '../types';
import { AuthRequest as AuthMiddlewareRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: AuthMiddlewareRequest, res: Response) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const result = await sql`
      INSERT INTO users (email, password, name, communication_style)
      VALUES (${email}, ${hashedPassword}, ${name}, 'professional')
      RETURNING id, email, name, job_title, interests, communication_style, avatar_url, created_at, updated_at
    `;

    const user = result[0] as User;
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: AuthMiddlewareRequest, res: Response) => {
  try {
    const { email, password }: AuthRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0] as any;
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        job_title: user.job_title,
        interests: user.interests,
        communication_style: user.communication_style,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
