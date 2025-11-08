import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './Routes/auth.routes.js';
import projectRoutes from './Routes/project.routes.js';
import pageRoutes from './Routes/page.routes.js';
import boardRoutes from './Routes/board.routes.js';
import cardRoutes from './Routes/card.routes.js';
import activityRoutes from './Routes/activity.routes.js';
import userRoutes from './Routes/user.routes.js';
import notificationRoutes from './Routes/notification.routes.js';
import invitationRoutes from './Routes/invitation.routes.js';
import searchRoutes from './Routes/search.routes.js';
import dashboardRoutes from './Routes/dashboard.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://synchronos-dr2o.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`Socket ${socket.id} left project ${projectId}`);
  });

  // Join page room for collaborative editing
  socket.on('join-page', ({ pageId, user }) => {
    socket.join(`page-${pageId}`);
    const userId = user._id || user.id;
    socket.userId = userId;
    socket.userName = user.name || 'Anonymous';
    socket.userColor = user.color || `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    console.log(`Socket ${socket.id} (${socket.userName}) joined page ${pageId}`);
    
    // Notify others that a user joined
    socket.to(`page-${pageId}`).emit('user-joined', {
      user: {
        id: userId,
        userId: userId,
        userName: socket.userName,
        userColor: socket.userColor,
        socketId: socket.id,
      }
    });
  });

  // Leave page room
  socket.on('leave-page', (pageId) => {
    // Notify others that user left
    socket.to(`page-${pageId}`).emit('user-left', {
      userId: socket.userId,
      socketId: socket.id,
    });
    
    socket.leave(`page-${pageId}`);
    console.log(`Socket ${socket.id} left page ${pageId}`);
  });

  // Live cursor position updates
  socket.on('cursor-move', ({ pageId, position }) => {
    console.log(`📍 Cursor move from ${socket.userName} at page ${pageId}:`, position);
    socket.to(`page-${pageId}`).emit('cursor-update', {
      userId: socket.userId,
      userName: socket.userName,
      userColor: socket.userColor,
      socketId: socket.id,
      position,
    });
  });

  // Text selection updates
  socket.on('selection-change', ({ pageId, selection }) => {
    socket.to(`page-${pageId}`).emit('selection-update', {
      userId: socket.userId,
      userName: socket.userName,
      userColor: socket.userColor,
      socketId: socket.id,
      selection,
    });
  });

  // Real-time text changes
  socket.on('content-change', ({ pageId, content, cursorPosition }) => {
    socket.to(`page-${pageId}`).emit('content-update', {
      userId: socket.userId,
      content,
      cursorPosition,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Notify all rooms that this user disconnected
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('page-')) {
        socket.to(room).emit('user-left', {
          userId: socket.userId,
          socketId: socket.id,
        });
      }
    });
    
    console.log('Client disconnected:', socket.id);
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export { io };
