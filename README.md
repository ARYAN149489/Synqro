<div align="center">

# 💬 Synqro

**A modern, real-time group chat application**

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4+-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built with React, Node.js, Express, Socket.IO, and MongoDB

### 🚀 **[Live Demo](https://synqro.netlify.app)** | **[Backend API](https://chitchat-lihl.onrender.com)**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API](#-api-endpoints) • [Deployment](#-deployment)

</div>

---

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- 💬 **Real-time Messaging** - Instant message delivery powered by Socket.IO WebSockets
- 👥 **Group Chat** - Create and join multiple group conversations
- ✍️ **Typing Indicators** - See when other users are typing in real-time
- 🟢 **Online Status** - Live user presence tracking
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🎨 **Modern Interface** - Clean design built with Chakra UI

## 🛠️ Tech Stack

**Frontend:** React 18 • Vite • Chakra UI • Socket.IO Client • React Router • Axios

**Backend:** Node.js • Express.js • Socket.IO • MongoDB • Mongoose • JWT • bcrypt

**Deployment:** Netlify (Frontend) • Render (Backend) • MongoDB Atlas (Database)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas account)

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/ARYAN149489/ChitChat.git
cd ChitChat

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URL, JWT secret, etc.
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

**Access the app:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 🔐 Environment Variables

### Backend `.env`
```env
MONGO_URL=mongodb://localhost:27017/chitchat
JWT_SECRET=your_secure_random_string
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:3000
```

## 📁 Project Structure

```
ChitChat/
├── backend/
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB schemas (User, Group, Message)
│   ├── routes/          # API routes
│   ├── server.js        # Express server setup
│   └── socket.js        # Socket.IO configuration
│
└── frontend/
    ├── src/
    │   ├── components/  # ChatArea, Sidebar, UsersList
    │   ├── pages/       # Landing, Login, Register, Chat
    │   └── App.jsx      # Root component
    └── vite.config.js
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create new group |
| POST | `/api/groups/:id/join` | Join a group |
| POST | `/api/groups/:id/leave` | Leave a group |
| GET | `/api/messages/:groupId` | Get group messages |
| POST | `/api/messages` | Send message |
| GET | `/health` | Health check |

## 🚀 Deployment

### Backend (Render)

1. **Connect Repository:** Link your GitHub repo to Render
2. **Configure Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables:**
   - `MONGO_URL` - MongoDB Atlas connection string
   - `JWT_SECRET` - Secure JWT secret key
   - `FRONTEND_URL` - Your Netlify URL (e.g., `https://synqro.netlify.app`)
   - `PORT` - 3000

### Frontend (Netlify)

1. **Connect Repository:** Link your GitHub repo to Netlify
2. **Configure Settings:**
   - Base Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`
3. **Environment Variables:**
   - `VITE_BACKEND_URL` - Your Render backend URL (e.g., `https://chitchat-lihl.onrender.com`)

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP: `0.0.0.0/0` (allow all IPs for Render/Netlify)
3. Get connection string and add to Render environment variables

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
git checkout -b feature/AmazingFeature
git commit -m 'Add some AmazingFeature'
git push origin feature/AmazingFeature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aryan Kansal** - Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ARYAN149489-181717?logo=github)](https://github.com/ARYAN149489)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://linkedin.com/in/aryan-kansal)
[![Email](https://img.shields.io/badge/Email-aryankansal113@gmail.com-D14836?logo=gmail&logoColor=white)](mailto:aryankansal113@gmail.com)

## 📞 Support

⭐ Star this repo if you find it helpful!

📧 **Contact:** aryankansal113@gmail.com  
🐛 **Issues:** [GitHub Issues](https://github.com/ARYAN149489/ChitChat/issues)

---

<div align="center">

**Made with ❤️ by Aryan Kansal**

*© 2026 Synqro - Real-time Group Chat Application*

</div>