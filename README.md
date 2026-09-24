# Notification Hub

A real-time notification system demonstrating distributed systems patterns with Server-Sent Events (SSE) and Redis pub/sub.

## Why This Project?

Most applications need real-time updates: notifications, alerts, live feeds. This project shows how to build that at scale:
- **No polling** — Server pushes messages to clients via SSE
- **Distributed messaging** — Redis pub/sub handles multi-server scenarios
- **Clean architecture** — Separation of concerns (database, messaging, real-time)

## What It Does

Users subscribe to topics and receive instant notifications without page refreshes. Perfect for dashboards, notification systems, or live feeds.

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Drizzle ORM, Redis, TypeScript

**Frontend:** Next.js, React, TypeScript, CSS Modules

**Real-time:** Server-Sent Events (SSE), Redis Pub/Sub

## Architecture

![architecture](https://github.com/user-attachments/assets/911b5f37-fc86-4ff6-9d68-4f8501eeda14)

### SSE Flow:
- User connects to `/api/events/:userId`
- Backend fetches user's topic subscriptions
- Backend subscribes to Redis channels for those topics
- When message published to topic → Redis broadcasts
- Backend forwards to all connected SSE clients on that topic

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/topics` | List all topics |
| POST | `/api/subscriptions` | Subscribe to topic |
| GET | `/api/subscriptions/:userId` | Get user subscriptions |
| POST | `/api/publish` | Publish message to topic |
| GET | `/api/events/:userId` | SSE connection (real-time messages) |

## Setup

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis (Memurai on Windows, or native on Linux/Mac)


## Backend Setup

**1. Create `.env` file in `notification-hub-backend/`:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=notification_hub
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
NODE_ENV=development
PORT=4000
```

**2. Install dependencies:**

```bash
cd notification-hub-backend
npm install
```

**3. Create database and tables:**

```bash
npx drizzle-kit push
```

**4. Seed default topics:**

```bash
npm run seed
```

**5. Start the server:**

```bash
npm run dev
```

Server runs on `http://localhost:4000`

## Frontend Setup

**1. Create `.env.local` file in `notification-hub-frontend/`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**2. Install dependencies:**

```bash
cd notification-hub-frontend
npm install
```

**3. Start the development server:**

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### Testing

- Open http://localhost:3000
- Signup with email + password
- Subscribe to topics
- Open a second browser window and publish a message
- Watch it appear in real-time

## Key Features

- ✅ Real-time messaging via SSE (no polling)
- ✅ Redis pub/sub for scalable message broadcasting
- ✅ Topic-based subscriptions (users only get relevant messages)
- ✅ Full-stack TypeScript
- ✅ Clean, production-ready code

## Design Decisions

**Why SSE over WebSockets?**
- Simpler for one-directional messaging (server → client)
- Built on HTTP, no extra protocol overhead
- Automatic reconnection, built-in event handling

**Why Redis Pub/Sub?**
- Efficient message broadcasting
- Decouples database writes from real-time delivery
- Non-blocking (fire-and-forget pattern)
- Scales horizontally

**Why separate database and messaging layers?**
- PostgreSQL persists all messages (audit trail)
- Redis handles real-time delivery (subscribers get messages immediately)
- If Redis fails, messages still exist in DB
- If new subscriber connects later, they can fetch from DB

## Future Enhancements

- Message history / persistence from Redis
- User authentication with JWT
- Admin panel for topic management
- Horizontal scaling with message queues
- Unsubscribe functionality
- User profiles and permissions

## License

MIT