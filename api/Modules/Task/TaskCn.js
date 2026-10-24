import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import { recordTaskHistory } from "../TaskHistory/TaskHistoryService.js";
import { createAndSendNotification } from "../Notification/NotificationService.js";
import { emitToProject, emitToTask } from "../../socket/socket.js";

export const checkProjectAccess = async (userId, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { teamId: true, companyId: true },
  });
  if (!project) return false;

  const [teamMember, projectMember, companyMember] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId } },
    }),
    prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: +projectId, userId } },
    }),
    prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId: project.companyId, userId } },
    }),
  ]);

  if (teamMember || projectMember) return true;
  if (companyMember && companyMember.role !== "MEMBER") return true;
  return false;
};

export const getMyTasks = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    projectId,
    search,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = `user:${userId}:tasks:${JSON.stringify({ page: pageNum, limit: limitNum, status, priority, projectId, search })}`;
  const cacheData = await redis.get(cacheKey);
  if (cacheData) {
    return res.status(200).json({
      success: true,
      message: req.t ? req.t("tasks.fetchedSuccess") : "Tasks fetched successfully",
      ...JSON.parse(cacheData),
    });
  }

  const where = {
    OR: [
      { assigneeId: userId },
      { reporterId: userId },
    ],
    ...(projectId && { projectId: +projectId }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const [tasks, count] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            teamId: true,
            companyId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            history: true,
            timeEntries: true,
          },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const responsePayload = {
    data: tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      pages: Math.ceil(count / limitNum) || 1,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(responsePayload), { EX: 60 * 10 });
  } catch (err) {
    console.error("Redis cache error in getMyTasks:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    ...responsePayload,
  });
});

export const getOneTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;
  const cacheKey = `task:${id}:user:${userId}`;

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: JSON.parse(cachedData),
    });
  }

  const task = await prisma.task.findUnique({
    where: { id: +id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          teamId: true,
          companyId: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          avatar: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          avatar: true,
        },
      },
      comments: {
        take: 20,
        orderBy: { createdAt: "desc" },
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
      },
      history: {
        take: 20,
        orderBy: { createdAt: "desc" },
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
      },
      timeEntries: {
        take: 20,
        orderBy: { date: "desc" },
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
      },
    },
  });

  if (!task) {
    return next(new HandleERROR("Task not found", 404));
  }

  const hasAccess = await checkProjectAccess(userId, task.projectId);
  if (!hasAccess) {
    return next(new HandleERROR("You do not have access to this task", 403));
  }

  // Calculate total time logged dynamically
  const timeAggregate = await prisma.timeEntry.aggregate({
    where: { taskId: +id },
    _sum: { duration: true },
  });

  const taskWithTotals = {
    ...task,
    totalLoggedMinutes: timeAggregate._sum.duration || 0,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(taskWithTotals), { EX: 60 * 10 });
  } catch (err) {
    console.error("Redis cache error in getOneTask:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("tasks.fetchedSuccess") : "Task fetched successfully",
    data: taskWithTotals,
  });
});

export const createTask = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    status = "TODO",
    priority = "MEDIUM",
    projectId,
    assignedToId,
    assigneeId: directAssigneeId,
    dueDate,
    storyPoints,
    estimatedMinutes,
  } = req.body;
  const userId = req.userId;

  const assigneeId = directAssigneeId !== undefined ? directAssigneeId : assignedToId;

  if (!title || !projectId) {
    return next(new HandleERROR("Title and Project ID are required", 400));
  }

  const hasAccess = await checkProjectAccess(userId, projectId);
  if (!hasAccess) {
    return next(new HandleERROR("You do not have access to this project", 403));
  }

  const task = await prisma.$transaction(async (tx) => {
    const newTask = await tx.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        projectId: +projectId,
        reporterId: userId,
        ...(assigneeId && { assigneeId: +assigneeId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(storyPoints !== undefined && { storyPoints: storyPoints !== null ? +storyPoints : null }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes: estimatedMinutes !== null ? +estimatedMinutes : null }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Record creation history
    await recordTaskHistory({
      taskId: newTask.id,
      userId,
      action: "Task Created",
      field: "task",
      newValue: newTask.title,
      tx,
    });

    return newTask;
  });

  // Notify assignee if assigned to someone else
  if (task.assigneeId && task.assigneeId !== userId) {
    const actorName = req.user?.name || "Team Member";
    await createAndSendNotification({
      userId: task.assigneeId,
      title: "Task Assigned",
      message: `Task "${task.title}" was assigned to you by ${actorName}`,
      type: "TASK_ASSIGNED",
      taskId: task.id,
      projectId: task.projectId,
    });
  }

  await deleteKeysByPattern(`user:*:tasks:*`);
  await deleteKeysByPattern(`project:${projectId}:tasks:*`);
  emitToProject(projectId, "task_created", task);

  return res.status(201).json({
    success: true,
    message: req.t ? req.t("tasks.createdSuccess") : "Task created successfully",
    data: task,
  });
});

export const updateTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    projectId,
    assignedToId,
    assigneeId: directAssigneeId,
    dueDate,
    storyPoints,
    estimatedMinutes,
  } = req.body;
  const userId = req.userId;

  const assigneeId = directAssigneeId !== undefined ? directAssigneeId : assignedToId;

  const currentTask = await prisma.task.findUnique({
    where: { id: +id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      projectId: true,
      assigneeId: true,
      reporterId: true,
      dueDate: true,
      storyPoints: true,
      estimatedMinutes: true,
    },
  });

  if (!currentTask) {
    return next(new HandleERROR("Task not found", 404));
  }

  const hasAccess = await checkProjectAccess(userId, currentTask.projectId);
  if (!hasAccess) {
    return next(new HandleERROR("You do not have access to this task", 403));
  }

  const updatedTask = await prisma.$transaction(async (tx) => {
    // Record history for each modified field
    if (status && status !== currentTask.status) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Status Updated",
        field: "status",
        oldValue: currentTask.status,
        newValue: status,
        tx,
      });

      // Send status change notification if appropriate
      const targetUser = currentTask.assigneeId !== userId ? currentTask.assigneeId : (currentTask.reporterId !== userId ? currentTask.reporterId : null);
      if (targetUser) {
        const actorName = req.user?.name || "Team Member";
        await createAndSendNotification({
          userId: targetUser,
          title: "Task Status Updated",
          message: `Task "${currentTask.title}" status changed from ${currentTask.status} to ${status} by ${actorName}`,
          type: "TASK_STATUS_CHANGED",
          taskId: +id,
          projectId: currentTask.projectId,
          tx,
        });
      }
    }

    if (priority && priority !== currentTask.priority) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Priority Updated",
        field: "priority",
        oldValue: currentTask.priority,
        newValue: priority,
        tx,
      });

      if (currentTask.assigneeId && currentTask.assigneeId !== userId) {
        const actorName = req.user?.name || "Team Member";
        await createAndSendNotification({
          userId: currentTask.assigneeId,
          title: "Task Priority Updated",
          message: `Task "${currentTask.title}" priority changed to ${priority} by ${actorName}`,
          type: "TASK_PRIORITY_CHANGED",
          taskId: +id,
          projectId: currentTask.projectId,
          tx,
        });
      }
    }

    if (title && title.trim() !== currentTask.title) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Title Updated",
        field: "title",
        oldValue: currentTask.title,
        newValue: title.trim(),
        tx,
      });
    }

    if (description !== undefined && description !== currentTask.description) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Description Updated",
        field: "description",
        oldValue: currentTask.description ? "(previous description)" : "(empty)",
        newValue: description ? "(updated description)" : "(cleared)",
        tx,
      });
    }

    if (assigneeId !== undefined && assigneeId !== currentTask.assigneeId) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Assignee Changed",
        field: "assignee",
        oldValue: currentTask.assigneeId ? `User #${currentTask.assigneeId}` : "Unassigned",
        newValue: assigneeId ? `User #${assigneeId}` : "Unassigned",
        tx,
      });

      if (assigneeId && assigneeId !== userId) {
        const actorName = req.user?.name || "Team Member";
        await createAndSendNotification({
          userId: +assigneeId,
          title: "Task Assigned",
          message: `Task "${currentTask.title}" was assigned to you by ${actorName}`,
          type: "TASK_ASSIGNED",
          taskId: +id,
          projectId: currentTask.projectId,
          tx,
        });
      }
    }

    if (dueDate !== undefined) {
      const newDue = dueDate ? new Date(dueDate).toISOString() : null;
      const oldDue = currentTask.dueDate ? currentTask.dueDate.toISOString() : null;
      if (newDue !== oldDue) {
        await recordTaskHistory({
          taskId: +id,
          userId,
          action: "Due Date Changed",
          field: "dueDate",
          oldValue: oldDue,
          newValue: newDue,
          tx,
        });
      }
    }

    if (estimatedMinutes !== undefined && estimatedMinutes !== currentTask.estimatedMinutes) {
      await recordTaskHistory({
        taskId: +id,
        userId,
        action: "Estimate Updated",
        field: "estimatedMinutes",
        oldValue: currentTask.estimatedMinutes ? `${currentTask.estimatedMinutes}m` : "None",
        newValue: estimatedMinutes ? `${estimatedMinutes}m` : "None",
        tx,
      });
    }

    return await tx.task.update({
      where: { id: +id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(projectId && { projectId: +projectId }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? +assigneeId : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(storyPoints !== undefined && { storyPoints: storyPoints !== null ? +storyPoints : null }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes: estimatedMinutes !== null ? +estimatedMinutes : null }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });
  });

  await deleteKeysByPattern(`task:${id}:*`);
  await deleteKeysByPattern(`user:*:tasks:*`);
  await deleteKeysByPattern(`project:${currentTask.projectId}:tasks:*`);

  emitToTask(id, "task_updated", updatedTask);
  emitToProject(currentTask.projectId, "task_updated", updatedTask);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("tasks.updatedSuccess") : "Task updated successfully",
    data: updatedTask,
  });
});

export const updateStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.userId;

  const currentTask = await prisma.task.findUnique({
    where: { id: +id },
    select: {
      id: true,
      title: true,
      status: true,
      projectId: true,
      assigneeId: true,
      reporterId: true,
    },
  });

  if (!currentTask) {
    return next(new HandleERROR("Task not found", 404));
  }

  const hasAccess = await checkProjectAccess(userId, currentTask.projectId);
  if (!hasAccess) {
    return next(new HandleERROR("You do not have access to this task", 403));
  }

  if (status === currentTask.status) {
    return res.status(200).json({
      success: true,
      message: "Task status unchanged",
      data: currentTask,
    });
  }

  const updatedTask = await prisma.$transaction(async (tx) => {
    await recordTaskHistory({
      taskId: +id,
      userId,
      action: "Status Updated",
      field: "status",
      oldValue: currentTask.status,
      newValue: status,
      tx,
    });

    const targetUser = currentTask.assigneeId !== userId ? currentTask.assigneeId : (currentTask.reporterId !== userId ? currentTask.reporterId : null);
    if (targetUser) {
      const actorName = req.user?.name || "Team Member";
      await createAndSendNotification({
        userId: targetUser,
        title: "Task Status Updated",
        message: `Task "${currentTask.title}" status changed to ${status} by ${actorName}`,
        type: "TASK_STATUS_CHANGED",
        taskId: +id,
        projectId: currentTask.projectId,
        tx,
      });
    }

    return await tx.task.update({
      where: { id: +id },
      data: { status },
      include: {
        assignee: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, phoneNumber: true, avatar: true },
        },
      },
    });
  });

  await deleteKeysByPattern(`task:${id}:*`);
  await deleteKeysByPattern(`user:*:tasks:*`);
  await deleteKeysByPattern(`project:${currentTask.projectId}:tasks:*`);

  emitToTask(id, "task_updated", updatedTask);
  emitToProject(currentTask.projectId, "task_updated", updatedTask);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("tasks.updatedSuccess") : "Task status updated successfully",
    data: updatedTask,
  });
});

export const deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;

  const currentTask = await prisma.task.findUnique({
    where: { id: +id },
    select: {
      id: true,
      projectId: true,
      title: true,
    },
  });

  if (!currentTask) {
    return next(new HandleERROR("Task not found", 404));
  }

  const hasAccess = await checkProjectAccess(userId, currentTask.projectId);
  if (!hasAccess) {
    return next(new HandleERROR("You do not have access to this task", 403));
  }

  const deletedTask = await prisma.task.delete({
    where: { id: +id },
  });

  await deleteKeysByPattern(`task:${id}:*`);
  await deleteKeysByPattern(`user:*:tasks:*`);
  await deleteKeysByPattern(`project:${currentTask.projectId}:tasks:*`);

  emitToTask(id, "task_deleted", { id: +id, projectId: currentTask.projectId });
  emitToProject(currentTask.projectId, "task_deleted", { id: +id, projectId: currentTask.projectId });

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("tasks.deletedSuccess") : "Task deleted successfully",
    data: deletedTask,
  });
});

export default {
  getMyTasks,
  getOneTask,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
};