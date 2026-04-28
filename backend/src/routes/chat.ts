import { Router, Response } from 'express';
import { sql } from '../database/connection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create new chat session
router.post('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;

    const result = await sql`
      INSERT INTO chat_sessions (user_id, title)
      VALUES (${req.userId}, ${title || 'New Chat'})
      RETURNING id, user_id, title, created_at, updated_at
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get user's chat sessions
router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await sql`
      SELECT * FROM chat_sessions
      WHERE user_id = ${req.userId}
      ORDER BY updated_at DESC
    `;

    res.json(result);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get messages from a session
router.get('/sessions/:sessionId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Verify ownership
    const session = await sql`
      SELECT id FROM chat_sessions
      WHERE id = ${sessionId} AND user_id = ${req.userId}
    `;

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await sql`
      SELECT * FROM messages
      WHERE chat_session_id = ${sessionId}
      ORDER BY created_at ASC
    `;

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await sql`
      DELETE FROM chat_sessions
      WHERE id = ${sessionId} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
