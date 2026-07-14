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

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
];

// Add production frontend URL if environment variable is set
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}


const io = socketio(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// CORS middleware with detailed logging
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) {
            console.log('✅ Allowed: No origin (server-to-server)');
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Allowed origin:', origin);
            return callback(null, true);
        } else {
            console.log('❌ Blocked origin:', origin);
            console.log('📋 Allowed origins are:', allowedOrigins);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDb connected."))
    .catch((err) => { console.log(err) });

//initialize
socketIo(io);
app.set('io', io);

// Health check route
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        app: 'Synqro API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            groups: '/api/groups',
            messages: '/api/messages',
        },
    });
});

// routes
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);
app.use('/api/messages', messageRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, console.log("Server is running on port ", PORT));