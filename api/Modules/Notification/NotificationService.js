import prisma from "../../src/config/prisma.js";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import { emitToUser } from "../../socket/socket.js";

/**
 * Creates a notification in the database, invalidates user's notification cache,
 * and emits a real-time event to the recipient via Socket.IO.
 */
export const createAndSendNotification = async ({
  userId,
  title,
  message,
  type = "TASK_ASSIGNED",
  taskId = null,
  projectId = null,
  tx = null,
}) => {
  if (!userId) return null;

  const db = tx || prisma;

  try {
    const notification = await db.notification.create({
      data: {
        userId: +userId,
        title,
        message,
        type,
        ...(taskId && { taskId: +taskId }),
        ...(projectId && { projectId: +projectId }),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    // Invalidate Redis cache for recipient
    try {
      const cacheKey = `user:${userId}:notifications:unread_count`;
      const cachePattern = `user:${userId}:notifications:*`;
      await redis.del(cacheKey);
      await deleteKeysByPattern(cachePattern);
    } catch (cacheErr) {
      console.error("Redis notification cache invalidation error:", cacheErr.message || cacheErr);
    }

    // Emit real-time notification to user's personal room
    emitToUser(userId, "new_notification", notification);

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message || error);
    return null;
  }
};

export default {
  createAndSendNotification,
};
