# notification-hub
A real-time notification system built with Node.js, Express, Redis pub/sub, and Server-Sent Events. Users subscribe to topics and receive instant notifications without polling. Demonstrates distributed systems patterns and scalable architecture.


<img width="2845" height="1957" alt="architecture" src="https://github.com/user-attachments/assets/911b5f37-fc86-4ff6-9d68-4f8501eeda14" />

### SSE Flow:
- User connects to /events
- Backend listens to Redis pub/sub
- When message published to topic → Redis broadcasts
- Backend forwards to all connected SSE clients on that topic

### API Endpoints
POST /subscribe (user subscribes to topic)
POST /publish (publish message to topic)
GET /events (SSE connection)
