export interface User {
  id: string;
  email: string;
  name: string;
  job_title?: string;
  interests?: string;
  communication_style: 'professional' | 'casual' | 'friendly';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  chat_session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}
