import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket && socket.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_API, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};