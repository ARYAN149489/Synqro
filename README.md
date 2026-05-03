<div align="center">

# 💬 Synqro

**Real-time Group Chat Application | MERN Stack + WebSockets**

[![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

🚀 **[Live Demo](https://synqro.netlify.app)** · **[Backend API](https://chitchat-lihl.onrender.com)**

</div>

---

## ✨ Key Features

- **Real-time Messaging** — Instant delivery via Socket.IO WebSockets
- **Group Chat** — Create, join, and leave multiple groups
- **JWT Authentication** — Secure login with bcrypt password hashing
- **Role-Based Access** — Admin-only group creation
- **Typing Indicators** — Live "user is typing" with debounced events
- **Online Presence** — Real-time connected users tracking per group
- **Full-Text Search** — MongoDB text indexes for searching groups & messages
- **Aggregation Analytics** — Group stats, top senders, and daily activity charts using MongoDB aggregation pipelines
- **Collapsible Panels** — Sidebar & members list with toggle buttons + auto-collapse on resize
- **Responsive UI** — Chakra UI components that adapt to all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Chakra UI, Socket.IO Client, React Router, Axios |
| **Backend** | Node.js, Express 5, Socket.IO, Mongoose, JWT, bcrypt |
| **Database** | MongoDB Atlas — with compound indexes, text indexes, aggregation pipelines |
| **Deployment** | Netlify (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## 📁 Project Structure

```
├── backend/
│   ├── server.js            # Express + Socket.IO + MongoDB setup
│   ├── socket.js            # Real-time event handling (rooms, typing, presence)
│   ├── middleware/           # JWT auth + admin role guard
│   ├── models/              # User, Group, Message schemas with indexes
│   └── routes/              # REST API + text search + aggregation endpoints
│
└── frontend/
    └── src/
        ├── pages/           # Landing, Login, Register, Chat
        └── components/      # Sidebar, ChatArea, UsersList, PrivateRoute
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login with JWT token |
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create group (admin) |
| GET | `/api/groups/search?q=` | Full-text search groups |
| GET | `/api/groups/stats` | Group analytics (aggregation) |
| POST | `/api/groups/:id/join` | Join a group |
| POST | `/api/groups/:id/leave` | Leave a group |
| GET | `/api/messages/:groupId` | Get group messages |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:groupId/search?q=` | Full-text search messages |
| GET | `/api/messages/:groupId/stats` | Chat analytics (aggregation) |

---

## 🗄️ MongoDB Features Used

**Indexes:**  Single field · Compound · Multikey · Text indexes

**Aggregation Pipelines:** `$group` · `$lookup` · `$unwind` · `$project` · `$match` · `$sort` · `$limit` · `$addToSet` · `$dateToString` · `$size`

**Operators:** `$text` · `$search` · `$meta: textScore` · `$gte` · `$sum` · `$max` · `$min`

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/ARYAN149489/Synqro.git && cd ChitChat

# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

**Environment Variables:**

```env
# backend/.env
MONGO_URL=mongodb://localhost:27017/chitchat
JWT_SECRET=your_secret_key
PORT=3000
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_BACKEND_URL=http://localhost:3000
```

Open **http://localhost:5173** and start chatting!

---

## 👨‍💻 Author

**Aryan Kansal** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ARYAN149489-181717?logo=github)](https://github.com/ARYAN149489)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://linkedin.com/in/aryan-kansal)
[![Email](https://img.shields.io/badge/Email-aryankansal113@gmail.com-D14836?logo=gmail&logoColor=white)](mailto:aryankansal113@gmail.com)

---

<div align="center">

⭐ **Star this repo if you find it helpful!**

*Built with the MERN Stack + WebSockets · © 2026 Synqro*

</div>