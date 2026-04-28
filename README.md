# AI Chat App - Full Stack Application

A production-ready chat application with personalized AI chatbot integration, built with modern tech stack.

## 🎯 Features

- **Real-time Chat**: WebSocket-based instant messaging
- **Personalized Chatbot**: AI adapts responses based on user profile
- **User Authentication**: Secure JWT-based auth
- **User Profiles**: Store and manage user preferences
- **Message History**: Persistent chat history
- **Modern UI**: Beautiful React + Tailwind CSS interface
- **RESTful API**: Complete backend API
- **Database**: PostgreSQL with migrations
- **Docker Support**: Easy deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
│    - Chat Interface                     │
│    - User Dashboard                     │
│    - Profile Management                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Backend API (Node.js + Express)      │
│    - Chat Routes                        │
│    - User Management                    │
│    - LLM Integration                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Database (PostgreSQL)              │
│    - Users                              │
│    - Messages                           │
│    - Chat Sessions                      │
└─────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Socket.io Client
- Axios
- Zustand (State Management)
- React Router

### Backend
- Node.js + Express
- PostgreSQL
- Socket.io
- JWT Authentication
- Anthropic Claude API (or OpenAI)
- TypeScript

### DevOps
- Docker & Docker Compose
- Environment Variables

## 📦 Project Structure

```
ai-chat-app/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── database/          # Database setup & migrations
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & other middleware
│   │   ├── services/          # Business logic
│   │   ├── socket/            # Socket.io handlers
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── store/             # Zustand stores
│   │   ├── services/          # API & Socket services
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml         # Container orchestration
├── .env.example               # Environment template
├── setup.sh                   # Setup script
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- Anthropic API Key or OpenAI API Key

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/ANUJSELF/ai-chat-app.git
cd ai-chat-app

# Create .env file
cp .env.example .env

# Edit .env and add your API key
echo "ANTHROPIC_API_KEY=your_key_here" >> .env

# Run containers
docker-compose up
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Local Development

```bash
git clone https://github.com/ANUJSELF/ai-chat-app.git
cd ai-chat-app

# Run setup script
bash setup.sh

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Terminal 1: Backend
cd backend
npm run migrate
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📚 Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_chat_db

# JWT
JWT_SECRET=your_secret_key_change_in_production

# LLM Provider (anthropic or openai)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
# OPENAI_API_KEY=your_openai_key

# Environment
NODE_ENV=development
PORT=5000

# Frontend URLs
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/me` - Get current user
- `PUT /api/user/profile` - Update user profile

### Chat
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions` - Get all user sessions
- `GET /api/chat/sessions/:sessionId/messages` - Get messages from session
- `DELETE /api/chat/sessions/:sessionId` - Delete session

## 🤖 AI Features

The chatbot uses **Anthropic Claude** (or OpenAI GPT) for intelligent responses, personalized based on:
- User profile information (name, job title)
- Communication preferences
- Conversation history
- User interests

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet.js for HTTP headers
- Environment variables for secrets
- Database query parameterization (SQL injection prevention)

## 📝 Database Schema

### Users Table
```sql
id (UUID)
email (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
name (VARCHAR)
job_title (VARCHAR)
interests (TEXT)
communication_style (VARCHAR)
avatar_url (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Chat Sessions Table
```sql
id (UUID)
user_id (UUID, FK)
title (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Messages Table
```sql
id (UUID)
chat_session_id (UUID, FK)
sender (VARCHAR: 'user' | 'assistant')
content (TEXT)
created_at (TIMESTAMP)
```

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0
heroku config:set JWT_SECRET=your_secret_key
heroku config:set ANTHROPIC_API_KEY=your_key
git push heroku main
```

### Railway.app
1. Connect GitHub repository
2. Create PostgreSQL plugin
3. Add environment variables
4. Deploy

### Docker Hub
```bash
docker build -t your-username/ai-chat-app .
docker push your-username/ai-chat-app
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ by ANUJSELF

## 🆘 Support

For issues and questions, please open a GitHub Issue.

---

**Happy Coding! 🚀**