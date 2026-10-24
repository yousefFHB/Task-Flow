import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // connected successfully
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToTask = (taskId) => {
  const s = getSocket();
  if (s && taskId) {
    s.emit('join_task', taskId);
  }
};

export const unsubscribeFromTask = (taskId) => {
  const s = getSocket();
  if (s && taskId) {
    s.emit('leave_task', taskId);
  }
};

export const subscribeToProject = (projectId) => {
  const s = getSocket();
  if (s && projectId) {
    s.emit('join_project', projectId);
  }
};

export const unsubscribeFromProject = (projectId) => {
  const s = getSocket();
  if (s && projectId) {
    s.emit('leave_project', projectId);
  }
};

export default {
  getSocket,
  disconnectSocket,
  subscribeToTask,
  unsubscribeFromTask,
  subscribeToProject,
  unsubscribeFromProject,
};
