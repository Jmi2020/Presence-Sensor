import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { sequelize, testConnection } from './config/database';
import { initMqtt } from './services/mqttService';
import podRoutes from './routes/podRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// API routes
app.use('/api/pods', podRoutes);

// Simple health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize database and sync models
async function initializeDatabase() {
  try {
    // Test the database connection
    await testConnection();
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Start the server
async function startServer() {
  // Initialize database
  const dbInitialized = await initializeDatabase();
  
  if (!dbInitialized) {
    console.error('Server startup aborted due to database initialization failure');
    process.exit(1);
  }
  
  // Initialize MQTT client
  initMqtt(io);
  
  // Start listening
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Close database connection
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start the application
startServer().catch((error) => {
  console.error('Failed to start server:', error);
});