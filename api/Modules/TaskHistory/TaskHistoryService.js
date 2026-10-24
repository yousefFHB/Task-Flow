import prisma from "../../src/config/prisma.js";
import redis from "../../config/redis.js";
import { emitToTask } from "../../socket/socket.js";

/**
 * Service to record task history entries, invalidate cache, and broadcast via Socket.IO
 */
export const recordTaskHistory = async ({
  taskId,
  userId,
  action,
  field = null,
  oldValue = null,
  newValue = null,
  tx = null,
}) => {
  if (!taskId || !userId) return null;

  const db = tx || prisma;

  try {
    const historyEntry = await db.taskHistory.create({
      data: {
        taskId: +taskId,
        userId: +userId,
        action,
        ...(field && { field: String(field) }),
        ...(oldValue !== null && oldValue !== undefined && { oldValue: String(oldValue) }),
        ...(newValue !== null && newValue !== undefined && { newValue: String(newValue) }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            avatar: true,
          },
        },
      },
    });

    // Invalidate Redis cache for this task's history
    try {
      await redis.del(`task:${taskId}:histories`);
    } catch (cacheErr) {
      console.error("Redis history cache invalidation error:", cacheErr.message || cacheErr);
    }

    // Broadcast real-time history update to task room
    emitToTask(taskId, "task_history_created", historyEntry);

    return historyEntry;
  } catch (error) {
    console.error("Failed to record task history:", error.message || error);
    return null;
  }
};

export default {
  recordTaskHistory,
};
