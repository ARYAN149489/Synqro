<div align="center">

# 💬 ChitChat

**A modern, real-time group chat application**

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4+-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built with React, Node.js, Express, Socket.IO, and MongoDB

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API](#-api-endpoints) • [Deployment](#-deployment)

</div>

---

## ✨ Features

- 🔐 JWT-based authentication with secure password hashing
- 💬 Real-time messaging with Socket.IO WebSocket connections
- 👥 Create and join multiple group chats
- ✍️ Live typing indicators and online status tracking
- 📱 Responsive UI with Chakra UI components
- 🔔 Real-time notifications for user join/leave events

## 🛠️ Tech Stack

**Frontend:** React 18 • Vite • Chakra UI • Socket.IO Client • React Router • Axios

**Backend:** Node.js • Express.js • Socket.IO • MongoDB • Mongoose • JWT • bcrypt

## 🚀 Installation

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

```bash
# Clone repository
git clone https://github.com/ARYAN149489/chitchat.git
cd chitchat

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env: MONGO_URL, JWT_SECRET, PORT, FRONTEND_URL
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_BACKEND_URL
npm run dev
```

**Access:** Frontend at `http://localhost:5173` • Backend at `http://localhost:3000`

## 🔧 API Endpoints

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| POST   | `/api/users/register`    | Register new user  |
| POST   | `/api/users/login`       | User login         |
| GET    | `/api/groups`            | Get all groups     |
| POST   | `/api/groups`            | Create new group   |
| POST   | `/api/groups/join`       | Join a group       |
| POST   | `/api/groups/leave`      | Leave a group      |
| GET    | `/api/messages/:groupId` | Get group messages |
| POST   | `/api/messages`          | Send message       |
| GET    | `/health`                | Health check       |

## 📁 Project Structure

```
backend/          # Express + Socket.IO server
├── middleware/   # Authentication middleware
├── models/       # MongoDB schemas (User, Group, Message)
├── routes/       # API routes
├── server.js     # Server setup
└── socket.js     # Socket.IO configuration

frontend/         # React + Vite application
├── src/
│   ├── components/  # ChatArea, Sidebar, UsersList
│   ├── pages/       # Landing, Login, Register, Chat
│   └── App.jsx      # Root component
```

## 🔐 Environment Variables

**Backend (`backend/.env`)**

```env
MONGO_URL=mongodb://localhost:27017/chitchat
JWT_SECRET=your_secure_random_string    # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**

```env
VITE_BACKEND_URL=http://localhost:3000
```

## 🚀 Deployment

**Recommended Platforms**

- Frontend: [Vercel](https://vercel.com) • [Netlify](https://netlify.com) • [Render](https://render.com)
- Backend: [Render](https://render.com) • [Railway](https://railway.app)
- Database: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier)

**Production Setup**

1. Update `MONGO_URL` with MongoDB Atlas connection string
2. Generate secure `JWT_SECRET` and configure environment variables
3. Set production URLs for `FRONTEND_URL` and `VITE_BACKEND_URL`
4. Enable HTTPS/SSL and configure CORS for your domain

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

```bash
git checkout -b feature/AmazingFeature
git commit -m 'Add AmazingFeature'
git push origin feature/AmazingFeature
```
## 👨‍💻 Author

**Aryan Kansal** - Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ARYAN149489-181717?logo=github)](https://github.com/ARYAN149489)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://linkedin.com/in/aryankansal113)
[![Email](https://img.shields.io/badge/Email-aryankansal113@gmail.com-D14836?logo=gmail&logoColor=white)](mailto:aryankansal113@gmail.com)

## 📞 Support

⭐ Star this repo if you find it helpful!

📧 **Contact:** aryankansal113@gmail.com  
🐛 **Issues:** [GitHub Issues](https://github.com/ARYAN149489/chitchat/issues)

---

<div align="center">

**Made with ❤️ by Aryan Kansal**

_© 2026 ChitChat - Real-time Group Chat Application_

</div>
