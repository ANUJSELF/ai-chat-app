import { Server as SocketIOServer, Socket } from 'socket.io';
import { sql } from '../database/connection';
import { verifyToken } from '../utils/jwt';
import { generateResponse } from '../services/llm';
import { v4 as uuidv4 } from 'uuid';
import { User, Message } from '../types';

export function initializeSocket(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    socket.on('authenticate', async (token: string) => {
      const payload = verifyToken(token);
      if (!payload) {
        socket.emit('error', 'Invalid token');
        socket.disconnect();
        return;
      }

      socket.data.userId = payload.userId;
      socket.data.userEmail = payload.email;
      socket.emit('authenticated', { success: true });
      console.log(`✅ User authenticated: ${payload.userId}`);
    });

    socket.on('send_message', async (data: any) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', 'Not authenticated');
          return;
        }

        const { sessionId, content } = data;

        // Get user data
        const userResult = await sql`SELECT * FROM users WHERE id = ${socket.data.userId}`;
        if (userResult.length === 0) {
          socket.emit('error', 'User not found');
          return;
        }
        const user = userResult[0] as User;

        // Verify session ownership
        const sessionResult = await sql`
          SELECT id FROM chat_sessions
          WHERE id = ${sessionId} AND user_id = ${socket.data.userId}
        `;
        if (sessionResult.length === 0) {
          socket.emit('error', 'Session not found');
          return;
        }

        // Save user message
        const userMessageId = uuidv4();
        await sql`
          INSERT INTO messages (id, chat_session_id, sender, content)
          VALUES (${userMessageId}, ${sessionId}, 'user', ${content})
        `;

        socket.emit('message_received', {
          id: userMessageId,
          sender: 'user',
          content,
          created_at: new Date().toISOString(),
        });

        // Get conversation history
        const history = await sql`
          SELECT * FROM messages
          WHERE chat_session_id = ${sessionId}
          ORDER BY created_at ASC
        `;

        // Generate AI response
        const aiResponse = await generateResponse(content, user, history as Message[]);

        // Save assistant message
        const assistantMessageId = uuidv4();
        await sql`
          INSERT INTO messages (id, chat_session_id, sender, content)
          VALUES (${assistantMessageId}, ${sessionId}, 'assistant', ${aiResponse})
        `;

        // Update session timestamp
        await sql`
          UPDATE chat_sessions SET updated_at = NOW() WHERE id = ${sessionId}
        `;

        socket.emit('message_received', {
          id: assistantMessageId,
          sender: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', 'Failed to process message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.id}`);
    });
  });
}
