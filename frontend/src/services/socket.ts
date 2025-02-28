import { io, Socket } from 'socket.io-client';
import { Pod } from '../types';

// Socket.io client for real-time updates
let socket: Socket | null = null;

export const initializeSocket = (onPodUpdate?: (pod: Pod) => void) => {
  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Initialize socket connection
  const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
  socket = io(socketUrl);

  // Socket event handlers
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  // Handle pod updates if callback provided
  if (onPodUpdate) {
    socket.on('podUpdate', (pod: Pod) => {
      console.log('Pod update received:', pod);
      onPodUpdate(pod);
    });
  }

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    console.log('WebSocket connection closed');
  }
};