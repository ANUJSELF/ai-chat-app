import { sql } from './connection';

async function migrate() {
  try {
    console.log('🔄 Running migrations...');

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255),
        interests TEXT,
        communication_style VARCHAR(50) DEFAULT 'professional',
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Chat Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Indices
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_chat_session_id ON messages(chat_session_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`;

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
