import { Server } from "socket.io";
import { socketAuth } from "./socketAuth.js";
import { registerPresenceHandler } from "./handler/presenceHandler.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: false,
    },
    pingTimeout: 60000,
    maxHttpBufferSize: 1e7,
    pingInterval: 25000,
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    registerPresenceHandler(io, socket);
  });

  io.on("error", (error) => {
    console.error("Socket Error:", error);
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    return null;
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, data);
};

export const emitToRoom = (room, event, data) => {
  if (!io || !room) return;
  io.to(room).emit(event, data);
};

export const emitToTask = (taskId, event, data) => {
  if (!io || !taskId) return;
  io.to(`task:${taskId.toString()}`).emit(event, data);
};

export const emitToProject = (projectId, event, data) => {
  if (!io || !projectId) return;
  io.to(`project:${projectId.toString()}`).emit(event, data);
};

export default {
  initSocket,
  getIo,
  emitToUser,
  emitToRoom,
  emitToTask,
  emitToProject,
};