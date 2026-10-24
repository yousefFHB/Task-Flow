import socketState from "../socketState.js";

export const registerPresenceHandler = (io, socket) => {
  const { user, userId } = socket;
  if (!userId) return;

  socket.join(`user:${userId}`);
  const isFirstConnection = socketState.addUserSocket(userId, socket.id);

  if (isFirstConnection) {
    socket.broadcast.emit("user_status_changed", {
      userId,
      status: "online",
      name: user.name,
    });
  }

  // Room subscriptions for live task & project updates
  socket.on("join_task", (taskId) => {
    if (taskId) {
      socket.join(`task:${taskId}`);
    }
  });

  socket.on("leave_task", (taskId) => {
    if (taskId) {
      socket.leave(`task:${taskId}`);
    }
  });

  socket.on("join_project", (projectId) => {
    if (projectId) {
      socket.join(`project:${projectId}`);
    }
  });

  socket.on("leave_project", (projectId) => {
    if (projectId) {
      socket.leave(`project:${projectId}`);
    }
  });

  socket.on("check_user_status", (targetUserIds, callback) => {
    if (typeof callback !== "function") return;
    if (Array.isArray(targetUserIds)) {
      const statuses = {};
      for (const id of targetUserIds) {
        statuses[id] = socketState.isUserOnline(id);
      }
      return callback({ success: true, data: statuses });
    }
    if (typeof targetUserIds === "number" || typeof targetUserIds === "string") {
      const isOnline = socketState.isUserOnline(targetUserIds);
      return callback({ success: true, data: { [targetUserIds]: isOnline } });
    }
    return callback({
      success: false,
      message: "invalid targetUserIds in payload",
    });
  });

  socket.on("get_online_users", (callback) => {
    if (typeof callback !== "function") return;
    return callback({
      success: true,
      data: socketState.getOnlineUserIds(),
    });
  });

  socket.on("disconnect", () => {
    const { userId: disconnectUserId, isOffline } = socketState.removeSocket(socket.id);
    if (disconnectUserId && isOffline) {
      io.emit("user_status_changed", {
        userId: disconnectUserId,
        status: "offline",
        lastSeen: new Date(),
      });
    }
  });
};

export default registerPresenceHandler;
