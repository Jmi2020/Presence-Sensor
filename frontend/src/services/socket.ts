import { io, Socket } from 'socket.io-client';
import { Pod } from '../types';

// Socket.io client for real-time updates
let socket: Socket | null = null;

export const initializeSocket = (onPodUpdate?: (pod: Pod) => void) => {
  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  try {
    // Initialize socket connection with retry options
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Attempting to reconnect (attempt ${attemptNumber})...`);
    });

    socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect to the server after multiple attempts');
    });

    // Handle pod updates if callback provided
    if (onPodUpdate) {
      socket.on('podUpdate', (pod: Pod) => {
        console.log('Pod update received:', pod);
        onPodUpdate(pod);
      });
    }

    return socket;
  } catch (err) {
    console.error('Error initializing socket:', err);
    return null;
  }
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    console.log('WebSocket connection closed');
  }
};