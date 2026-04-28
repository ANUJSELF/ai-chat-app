import { Router, Response } from 'express';
import { sql } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0] as any;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      job_title: user.job_title,
      interests: user.interests,
      communication_style: user.communication_style,
      avatar_url: user.avatar_url,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, job_title, interests, communication_style } = req.body;

    const result = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        job_title = COALESCE(${job_title}, job_title),
        interests = COALESCE(${interests}, interests),
        communication_style = COALESCE(${communication_style}, communication_style),
        updated_at = NOW()
      WHERE id = ${req.userId}
      RETURNING id, email, name, job_title, interests, communication_style, avatar_url
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
