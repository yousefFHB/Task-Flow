import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import { recordTaskHistory } from "../TaskHistory/TaskHistoryService.js";
import { createAndSendNotification } from "../Notification/NotificationService.js";
import { emitToTask } from "../../socket/socket.js";

// Helper to check user access to task
export const checkTaskAccess = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: +taskId },
    select: {
      id: true,
      title: true,
      projectId: true,
      assigneeId: true,
      reporterId: true,
      project: {
        select: {
          id: true,
          teamId: true,
          companyId: true,
        },
      },
    },
  });

  if (!task) return null;

  const [teamMember, projectMember, companyMember] = await Promise.all([
    prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: task.project.teamId,
          userId,
        },
      },
    }),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId,
        },
      },
    }),
    prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: task.project.companyId,
          userId,
        },
      },
    }),
  ]);

  if (!teamMember && !projectMember && !companyMember) {
    return false;
  }

  return { task, teamMember, projectMember, companyMember };
};

export const createComment = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId || req.body.taskId;
  const { content } = req.body;
  const userId = req.userId;

  if (!taskId) {
    return next(new HandleERROR("Task ID is required", 400));
  }

  const access = await checkTaskAccess(userId, taskId);
  if (access === null) {
    return next(new HandleERROR("Task not found", 404));
  }
  if (!access) {
    return next(new HandleERROR("You do not have permission to comment on this task", 403));
  }

  const { task } = access;

  const comment = await prisma.taskComment.create({
    data: {
      content,
      taskId: +taskId,
      userId,
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

  // Record history
  await recordTaskHistory({
    taskId: +taskId,
    userId,
    action: "Comment Added",
    field: "comment",
    newValue: content.length > 50 ? `${content.substring(0, 50)}...` : content,
  });

  // Invalidate Redis caches
  await deleteKeysByPattern(`task:${taskId}:comments:*`);
  await redis.del(`task:${taskId}:user:${userId}`);

  // Send notification to task assignee or reporter if they are not the commenter
  const recipientId = task.assigneeId && task.assigneeId !== userId ? task.assigneeId : (task.reporterId !== userId ? task.reporterId : null);
  if (recipientId) {
    const actorName = req.user?.name || "Someone";
    await createAndSendNotification({
      userId: recipientId,
      title: "New Comment on Task",
      message: `${actorName} commented on task "${task.title}"`,
      type: "TASK_COMMENTED",
      taskId: +taskId,
      projectId: task.projectId,
    });
  }

  // Broadcast to anyone currently viewing the task
  emitToTask(taskId, "comment_created", comment);

  return res.status(201).json({
    success: true,
    message: req.t ? req.t("comments.createdSuccess") : "Comment created successfully",
    data: comment,
  });
});

export const getComments = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const userId = req.userId;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const access = await checkTaskAccess(userId, taskId);
  if (access === null) {
    return next(new HandleERROR("Task not found", 404));
  }
  if (!access) {
    return next(new HandleERROR("You do not have permission to view comments for this task", 403));
  }

  const cacheKey = `task:${taskId}:comments:p${page}:l${limit}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      ...JSON.parse(cachedData),
    });
  }

  const [comments, totalCount] = await Promise.all([
    prisma.taskComment.findMany({
      where: { taskId: +taskId },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
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
    }),
    prisma.taskComment.count({ where: { taskId: +taskId } }),
  ]);

  const responsePayload = {
    data: comments,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit) || 1,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(responsePayload), { EX: 60 * 5 });
  } catch (err) {
    console.error("Redis set error in getComments:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("comments.fetchedSuccess") : "Comments fetched successfully",
    ...responsePayload,
  });
});

export const updateComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  const existingComment = await prisma.taskComment.findUnique({
    where: { id: +id },
    include: {
      task: {
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              companyId: true,
              teamId: true,
            },
          },
        },
      },
    },
  });

  if (!existingComment) {
    return next(new HandleERROR("Comment not found", 404));
  }

  // Authorization: must be the comment author or an admin
  const isAuthor = existingComment.userId === userId;
  if (!isAuthor) {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: existingComment.task.project.companyId,
          userId,
        },
      },
    });
    const isAdmin = companyMember && companyMember.role !== "MEMBER";
    if (!isAdmin) {
      return next(new HandleERROR("You do not have permission to edit this comment", 403));
    }
  }

  const updatedComment = await prisma.taskComment.update({
    where: { id: +id },
    data: { content },
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

  await deleteKeysByPattern(`task:${existingComment.taskId}:comments:*`);
  emitToTask(existingComment.taskId, "comment_updated", updatedComment);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("comments.updatedSuccess") : "Comment updated successfully",
    data: updatedComment,
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;

  const existingComment = await prisma.taskComment.findUnique({
    where: { id: +id },
    include: {
      task: {
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              companyId: true,
              teamId: true,
            },
          },
        },
      },
    },
  });

  if (!existingComment) {
    return next(new HandleERROR("Comment not found", 404));
  }

  // Authorization: must be the comment author or company/team lead/admin
  const isAuthor = existingComment.userId === userId;
  if (!isAuthor) {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: existingComment.task.project.companyId,
          userId,
        },
      },
    });
    const isAdmin = companyMember && companyMember.role !== "MEMBER";
    if (!isAdmin) {
      return next(new HandleERROR("You do not have permission to delete this comment", 403));
    }
  }

  await prisma.taskComment.delete({
    where: { id: +id },
  });

  await recordTaskHistory({
    taskId: existingComment.taskId,
    userId,
    action: "Comment Deleted",
    field: "comment",
  });

  await deleteKeysByPattern(`task:${existingComment.taskId}:comments:*`);
  emitToTask(existingComment.taskId, "comment_deleted", { id: +id, taskId: existingComment.taskId });

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("comments.deletedSuccess") : "Comment deleted successfully",
    data: { id: +id },
  });
});

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
