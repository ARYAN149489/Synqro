const express = require("express");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors')
const http = require('http');
const socketio = require('socket.io');
const userRouter = require("./routes/userRoutes");
const groupRouter = require('./routes/groupRoutes');
const messageRouter = require("./routes/messageRoutes");
const socketIo = require("./socket");
dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);

// CORS origins - support both dev ports and production URL
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);;
const io = socketio(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDb connected."))
    .catch((err) => { console.log(err) });

//initialize
socketIo(io);

// routes
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);
app.use('/api/messages', messageRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, console.log("Server is running on port ", PORT));