import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import { recordTaskHistory } from "../TaskHistory/TaskHistoryService.js";
import { createAndSendNotification } from "../Notification/NotificationService.js";
import { emitToProject, emitToTask } from "../../socket/socket.js";

// Helper to check user access to a project
export const checkProjectAccess = async (userId, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: {
      id: true,
      name: true,
      teamId: true,
      companyId: true,
    },
  });

  if (!project) return null;

  const [teamMember, projectMember, companyMember] = await Promise.all([
    prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId,
        },
      },
    }),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
    }),
    prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: project.companyId,
          userId,
        },
      },
    }),
  ]);

  if (!teamMember && !projectMember && !companyMember) {
    return false;
  }

  return { project, teamMember, projectMember, companyMember };
};

export const createTimeEntry = catchAsync(async (req, res, next) => {
  const { projectId, taskId, duration, date, description } = req.body;
  const userId = req.userId; // Always from authenticated session

  if (!duration || duration <= 0) {
    return next(new HandleERROR("Duration must be a positive integer in minutes", 400));
  }

  const access = await checkProjectAccess(userId, projectId);
  if (access === null) {
    return next(new HandleERROR("Project not found", 404));
  }
  if (!access) {
    return next(new HandleERROR("You do not have access to this project", 403));
  }

  let task = null;
  if (taskId) {
    task = await prisma.task.findUnique({
      where: { id: +taskId },
      select: {
        id: true,
        title: true,
        projectId: true,
        assigneeId: true,
      },
    });

    if (!task) {
      return next(new HandleERROR("Task not found", 404));
    }
    if (task.projectId !== +projectId) {
      return next(new HandleERROR("Task does not belong to the specified project", 400));
    }
  }

  const entryDate = date ? new Date(date) : new Date();

  // ── Rate Snapshot ─────────────────────────────────────────────────────────
  // First check if this specific member has a custom rate override on this project.
  const memberRate = await prisma.projectMemberRate.findUnique({
    where: {
      projectId_userId: { projectId: +projectId, userId },
    },
    select: { hourlyRateCents: true },
  });

  const projectForRate = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { hourlyRateCents: true },
  });

  // Priority: member custom rate > project default rate > null
  const rateSnapshotCents =
    memberRate?.hourlyRateCents ?? projectForRate?.hourlyRateCents ?? null;
  // earningsCents = (duration / 60) * rateSnapshotCents, rounded to nearest cent
  const earningsCents =
    rateSnapshotCents !== null
      ? Math.round((+duration / 60) * rateSnapshotCents)
      : null;

  const timeEntry = await prisma.timeEntry.create({
    data: {
      userId,
      projectId: +projectId,
      ...(taskId && { taskId: +taskId }),
      duration: +duration,
      date: entryDate,
      description: description?.trim() || null,
      rateSnapshotCents,
      earningsCents,
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
      task: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Record history on the task if associated
  if (taskId && task) {
    await recordTaskHistory({
      taskId: +taskId,
      userId,
      action: "Time Logged",
      field: "timeSpent",
      newValue: `${duration}m`,
    });

    // Notify task assignee if someone else logged time on their task
    if (task.assigneeId && task.assigneeId !== userId) {
      const actorName = req.user?.name || "Team Member";
      await createAndSendNotification({
        userId: task.assigneeId,
        title: "Work Logged on Task",
        message: `${actorName} logged ${duration} minutes on "${task.title}"`,
        type: "TIME_LOGGED",
        taskId: +taskId,
        projectId: +projectId,
      });
    }

    emitToTask(taskId, "time_entry_created", timeEntry);
  }

  // Invalidate Redis caches
  await deleteKeysByPattern(`project:${projectId}:time-entries:*`);
  if (taskId) {
    await deleteKeysByPattern(`task:${taskId}:time-entries:*`);
  }
  await deleteKeysByPattern(`user:${userId}:time-entries:*`);

  // Broadcast to project room
  emitToProject(projectId, "time_entry_created", timeEntry);

  return res.status(201).json({
    success: true,
    message: req.t ? req.t("timeTracking.createdSuccess") : "Time entry recorded successfully",
    data: timeEntry,
  });
});

export const getTimeEntries = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const {
    projectId,
    taskId,
    userId: filterUserId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Build where filter
  const where = {};

  if (projectId) {
    const access = await checkProjectAccess(userId, projectId);
    if (!access) {
      return next(new HandleERROR("You do not have access to this project's time logs", 403));
    }
    where.projectId = +projectId;
  }

  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: +taskId },
      select: { projectId: true },
    });
    if (!task) {
      return next(new HandleERROR("Task not found", 404));
    }
    const access = await checkProjectAccess(userId, task.projectId);
    if (!access) {
      return next(new HandleERROR("You do not have access to this task's time logs", 403));
    }
    where.taskId = +taskId;
  }

  if (filterUserId) {
    // Forbid cross-user global querying without project or task context
    if (!projectId && !taskId && +filterUserId !== userId) {
      return next(
        new HandleERROR("You do not have permission to view other users' time logs", 403)
      );
    }
    where.userId = +filterUserId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // If no project or task is specified, default to the current user's time entries
  if (!projectId && !taskId && !filterUserId) {
    where.userId = userId;
  }

  const [entries, totalCount, aggregateResult] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            companyId: true,
          },
        },
      },
    }),
    prisma.timeEntry.count({ where }),
    prisma.timeEntry.aggregate({
      where,
      _sum: {
        duration: true,
      },
    }),
  ]);

  const totalMinutes = aggregateResult._sum.duration || 0;

  // Sanitize rateSnapshotCents and earningsCents:
  // Only the entry owner or company admin/owner may view earnings data.
  // Regular members must never see other members' rates or calculated earnings.
  const adminCompanyIds = new Set();
  const companyMemberships = await prisma.companyMember.findMany({
    where: {
      userId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { companyId: true },
  });
  companyMemberships.forEach((m) => adminCompanyIds.add(m.companyId));

  const sanitizedEntries = entries.map((entry) => {
    const isOwner = entry.userId === userId;
    const isCompanyAdmin = entry.project?.companyId && adminCompanyIds.has(entry.project.companyId);
    if (isOwner || isCompanyAdmin) {
      return entry;
    }
    return {
      ...entry,
      rateSnapshotCents: null,
      earningsCents: null,
    };
  });

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.fetchedSuccess") : "Time entries fetched successfully",
    data: sanitizedEntries,
    totalMinutes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      pages: Math.ceil(totalCount / limitNum) || 1,
    },
  });
});

export const getTimeEntryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;

  const entry = await prisma.timeEntry.findUnique({
    where: { id: +id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          avatar: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          companyId: true,
          teamId: true,
        },
      },
    },
  });

  if (!entry) {
    return next(new HandleERROR("Time entry not found", 404));
  }

  const access = await checkProjectAccess(userId, entry.projectId);
  if (!access) {
    return next(new HandleERROR("You do not have permission to view this time entry", 403));
  }

  // Only the entry owner or company admin may view earnings details
  const isOwner = entry.userId === userId;
  let isCompanyAdmin = false;
  if (!isOwner && entry.project?.companyId) {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: entry.project.companyId,
          userId,
        },
      },
      select: { role: true },
    });
    isCompanyAdmin = companyMember && companyMember.role !== "MEMBER";
  }

  const sanitizedEntry =
    isOwner || isCompanyAdmin
      ? entry
      : {
          ...entry,
          rateSnapshotCents: null,
          earningsCents: null,
        };

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.fetchedSuccess") : "Time entry fetched successfully",
    data: sanitizedEntry,
  });
});

export const updateTimeEntry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { duration, date, description } = req.body;
  const userId = req.userId;

  const entry = await prisma.timeEntry.findUnique({
    where: { id: +id },
    include: {
      project: {
        select: {
          id: true,
          companyId: true,
        },
      },
    },
  });

  if (!entry) {
    return next(new HandleERROR("Time entry not found", 404));
  }

  // Only the creator or company owner/admin can edit
  const isOwner = entry.userId === userId;
  if (!isOwner) {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: entry.project.companyId,
          userId,
        },
      },
    });
    const isAdmin = companyMember && companyMember.role !== "MEMBER";
    if (!isAdmin) {
      return next(new HandleERROR("You do not have permission to edit this time entry", 403));
    }
  }

  if (duration !== undefined && duration <= 0) {
    return next(new HandleERROR("Duration must be a positive integer in minutes", 400));
  }

  // If duration changed, recalculate earnings using the FROZEN rate snapshot
  let updatedEarningsCents = entry.earningsCents;
  if (duration !== undefined) {
    updatedEarningsCents =
      entry.rateSnapshotCents !== null
        ? Math.round((+duration / 60) * entry.rateSnapshotCents)
        : null;
  }

  const updatedEntry = await prisma.timeEntry.update({
    where: { id: +id },
    data: {
      ...(duration !== undefined && {
        duration: +duration,
        earningsCents: updatedEarningsCents,
      }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(description !== undefined && { description: description?.trim() || null }),
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
      task: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Invalidate Redis caches
  await deleteKeysByPattern(`project:${entry.projectId}:time-entries:*`);
  if (entry.taskId) {
    await deleteKeysByPattern(`task:${entry.taskId}:time-entries:*`);
    emitToTask(entry.taskId, "time_entry_updated", updatedEntry);
  }
  await deleteKeysByPattern(`user:${entry.userId}:time-entries:*`);
  emitToProject(entry.projectId, "time_entry_updated", updatedEntry);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.updatedSuccess") : "Time entry updated successfully",
    data: updatedEntry,
  });
});

export const deleteTimeEntry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;

  const entry = await prisma.timeEntry.findUnique({
    where: { id: +id },
    include: {
      project: {
        select: {
          id: true,
          companyId: true,
        },
      },
    },
  });

  if (!entry) {
    return next(new HandleERROR("Time entry not found", 404));
  }

  // Only the creator or company owner/admin can delete
  const isOwner = entry.userId === userId;
  if (!isOwner) {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: entry.project.companyId,
          userId,
        },
      },
    });
    const isAdmin = companyMember && companyMember.role !== "MEMBER";
    if (!isAdmin) {
      return next(new HandleERROR("You do not have permission to delete this time entry", 403));
    }
  }

  await prisma.timeEntry.delete({
    where: { id: +id },
  });

  // Invalidate caches
  await deleteKeysByPattern(`project:${entry.projectId}:time-entries:*`);
  if (entry.taskId) {
    await deleteKeysByPattern(`task:${entry.taskId}:time-entries:*`);
    emitToTask(entry.taskId, "time_entry_deleted", { id: +id, taskId: entry.taskId });
  }
  await deleteKeysByPattern(`user:${entry.userId}:time-entries:*`);
  emitToProject(entry.projectId, "time_entry_deleted", { id: +id, projectId: entry.projectId });

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.deletedSuccess") : "Time entry deleted successfully",
    data: { id: +id },
  });
});

export const getTaskTimeSummary = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.userId;

  const task = await prisma.task.findUnique({
    where: { id: +taskId },
    select: {
      id: true,
      title: true,
      projectId: true,
      storyPoints: true,
      estimatedMinutes: true,
    },
  });

  if (!task) {
    return next(new HandleERROR("Task not found", 404));
  }

  const access = await checkProjectAccess(userId, task.projectId);
  if (!access) {
    return next(new HandleERROR("You do not have permission to view this task", 403));
  }

  const aggregate = await prisma.timeEntry.aggregate({
    where: { taskId: +taskId },
    _sum: { duration: true },
    _count: { id: true },
  });

  const totalLoggedMinutes = aggregate._sum.duration || 0;
  const entryCount = aggregate._count.id || 0;

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.summaryFetched") : "Task time summary fetched successfully",
    data: {
      taskId: task.id,
      title: task.title,
      estimatedMinutes: task.estimatedMinutes,
      storyPoints: task.storyPoints,
      totalLoggedMinutes,
      entryCount,
      differenceMinutes: task.estimatedMinutes !== null ? totalLoggedMinutes - task.estimatedMinutes : null,
    },
  });
});

export const getProjectTimeSummary = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.userId;

  const access = await checkProjectAccess(userId, projectId);
  if (!access) {
    return next(new HandleERROR("You do not have permission to view this project's time logs", 403));
  }

  const [aggregate, userAggregates] = await Promise.all([
    prisma.timeEntry.aggregate({
      where: { projectId: +projectId },
      _sum: { duration: true },
      _count: { id: true },
    }),
    prisma.timeEntry.groupBy({
      by: ["userId"],
      where: { projectId: +projectId },
      _sum: { duration: true },
      _count: { id: true },
    }),
  ]);

  const userIds = userAggregates.map((u) => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phoneNumber: true, avatar: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const perUserSummary = userAggregates.map((item) => ({
    user: userMap.get(item.userId) || { id: item.userId, name: "Unknown" },
    totalMinutes: item._sum.duration || 0,
    entryCount: item._count.id || 0,
  }));

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("timeTracking.summaryFetched") : "Project time summary fetched successfully",
    data: {
      projectId: +projectId,
      totalMinutes: aggregate._sum.duration || 0,
      totalEntries: aggregate._count.id || 0,
      byUser: perUserSummary,
    },
  });
});

// ─── Project Rate Management & Member Custom Rates ──────────────────────────

/**
 * Verifies whether the requesting user is the creator of the company (OWNER)
 * or the creator of the project.
 */
export const isCompanyOwnerOrProjectCreator = async (userId, project) => {
  if (!project) return false;

  // 1. Check if user is the creator of the project
  if (project.creatorId && project.creatorId === userId) {
    return true;
  }

  // 2. Check if user is the OWNER of the company (company creator)
  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: project.companyId, userId } },
  });

  if (companyMember && companyMember.role === "OWNER") {
    return true;
  }

  // 3. Also check if company.creatorId === userId
  const company = await prisma.company.findUnique({
    where: { id: project.companyId },
    select: { creatorId: true },
  });
  if (company && company.creatorId === userId) {
    return true;
  }

  return false;
};

/**
 * GET /time-entries/project/:projectId/rate
 * Any project member can view the current project hourly rate and their own permission.
 */
export const getProjectRate = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.userId;

  const access = await checkProjectAccess(userId, projectId);
  if (!access) {
    return next(new HandleERROR("You do not have permission to view this project", 403));
  }

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { id: true, name: true, companyId: true, creatorId: true, hourlyRateCents: true, currency: true },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  const canManageRate = await isCompanyOwnerOrProjectCreator(userId, project);

  return res.status(200).json({
    success: true,
    message: "Project rate fetched successfully",
    data: {
      projectId: project.id,
      projectName: project.name,
      hourlyRateCents: project.hourlyRateCents,
      currency: project.currency,
      canManageRate,
      creatorId: project.creatorId,
      // Convenience decimal for display only — never use for calculations
      hourlyRateDisplay:
        project.hourlyRateCents !== null ? project.hourlyRateCents / 100 : null,
    },
  });
});

/**
 * PATCH /time-entries/project/:projectId/rate
 * Only the creator of the company (OWNER) or creator of the project can choose/update the hourly rate.
 * Rate change does NOT affect previously snapshotted time entries.
 */
export const setProjectRate = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { hourlyRateCents, currency } = req.body;
  const userId = req.userId;

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { id: true, companyId: true, creatorId: true, name: true },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  // Only company creator (OWNER) or project creator can set project hourly rate
  const canManage = await isCompanyOwnerOrProjectCreator(userId, project);

  if (!canManage) {
    return next(
      new HandleERROR(
        "Only the company owner or project creator can set the project hourly rate",
        403
      )
    );
  }

  const updatedProject = await prisma.project.update({
    where: { id: +projectId },
    data: {
      ...(hourlyRateCents !== undefined && {
        hourlyRateCents: hourlyRateCents === null ? null : +hourlyRateCents,
      }),
      ...(currency && { currency: currency.toUpperCase() }),
    },
    select: { id: true, name: true, hourlyRateCents: true, currency: true },
  });

  // Invalidate project caches
  await deleteKeysByPattern(`project:${projectId}:*`);

  return res.status(200).json({
    success: true,
    message: "Project hourly rate updated. Previously logged entries are unaffected.",
    data: {
      projectId: updatedProject.id,
      projectName: updatedProject.name,
      hourlyRateCents: updatedProject.hourlyRateCents,
      currency: updatedProject.currency,
      canManageRate: true,
      hourlyRateDisplay:
        updatedProject.hourlyRateCents !== null
          ? updatedProject.hourlyRateCents / 100
          : null,
    },
  });
});

/**
 * GET /time-entries/project/:projectId/member-rates
 * Lists all members of the project / project's team with their custom and effective rates.
 */
export const getProjectMemberRates = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.userId;

  const access = await checkProjectAccess(userId, projectId);
  if (!access) {
    return next(new HandleERROR("You do not have access to this project", 403));
  }

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: {
      id: true,
      name: true,
      companyId: true,
      creatorId: true,
      hourlyRateCents: true,
      currency: true,
      team: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              role: true,
              user: {
                select: { id: true, name: true, phoneNumber: true, avatar: true },
              },
            },
          },
        },
      },
      members: {
        select: {
          role: true,
          user: {
            select: { id: true, name: true, phoneNumber: true, avatar: true },
          },
        },
      },
    },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  const canManageRate = await isCompanyOwnerOrProjectCreator(userId, project);

  // Fetch all custom member rates configured for this project
  const customRates = await prisma.projectMemberRate.findMany({
    where: { projectId: +projectId },
  });
  const customRateMap = new Map(customRates.map((r) => [r.userId, r.hourlyRateCents]));

  // Collect unique users across team and project
  const userMap = new Map();

  for (const tm of project.team?.members || []) {
    if (tm.user) {
      userMap.set(tm.user.id, {
        ...tm.user,
        teamRole: tm.role,
      });
    }
  }

  for (const pm of project.members || []) {
    if (pm.user && !userMap.has(pm.user.id)) {
      userMap.set(pm.user.id, {
        ...pm.user,
        projectRole: pm.role,
      });
    }
  }

  const memberList = Array.from(userMap.values()).map((user) => {
    const customRate = customRateMap.get(user.id) ?? null;
    const effectiveRate = customRate !== null ? customRate : project.hourlyRateCents;
    return {
      userId: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      customHourlyRateCents: customRate,
      effectiveHourlyRateCents: effectiveRate,
      hasCustomRate: customRate !== null,
      customHourlyRateDisplay: customRate !== null ? customRate / 100 : null,
      effectiveHourlyRateDisplay: effectiveRate !== null ? effectiveRate / 100 : null,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Project member rates fetched successfully",
    data: {
      projectId: project.id,
      projectName: project.name,
      projectHourlyRateCents: project.hourlyRateCents,
      currency: project.currency,
      canManageRate,
      members: memberList,
    },
  });
});

/**
 * PUT / PATCH /time-entries/project/:projectId/member-rates/:targetUserId
 * Sets or updates a specific team member's custom hourly rate for this project.
 * Only the company owner or project creator can perform this.
 */
export const setProjectMemberRate = catchAsync(async (req, res, next) => {
  const { projectId, targetUserId } = req.params;
  const { hourlyRateCents } = req.body;
  const userId = req.userId;

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { id: true, companyId: true, creatorId: true, name: true, hourlyRateCents: true, currency: true },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  const canManage = await isCompanyOwnerOrProjectCreator(userId, project);
  if (!canManage) {
    return next(
      new HandleERROR(
        "Only the company owner or project creator can set member hourly rates",
        403
      )
    );
  }

  // If rate is null or empty, remove custom override
  if (hourlyRateCents === null || hourlyRateCents === undefined || hourlyRateCents === "") {
    await prisma.projectMemberRate.deleteMany({
      where: {
        projectId: +projectId,
        userId: +targetUserId,
      },
    });

    await deleteKeysByPattern(`project:${projectId}:*`);

    return res.status(200).json({
      success: true,
      message: "Member custom rate removed. Reverted to project default rate.",
      data: {
        projectId: +projectId,
        userId: +targetUserId,
        customHourlyRateCents: null,
        effectiveHourlyRateCents: project.hourlyRateCents,
        hasCustomRate: false,
      },
    });
  }

  const rateCents = Math.round(+hourlyRateCents);
  if (rateCents < 0) {
    return next(new HandleERROR("Hourly rate must be a non-negative integer", 400));
  }

  const memberRate = await prisma.projectMemberRate.upsert({
    where: {
      projectId_userId: { projectId: +projectId, userId: +targetUserId },
    },
    create: {
      projectId: +projectId,
      userId: +targetUserId,
      hourlyRateCents: rateCents,
    },
    update: {
      hourlyRateCents: rateCents,
    },
  });

  await deleteKeysByPattern(`project:${projectId}:*`);

  return res.status(200).json({
    success: true,
    message: "Member custom hourly rate set successfully.",
    data: {
      projectId: +projectId,
      userId: +targetUserId,
      customHourlyRateCents: memberRate.hourlyRateCents,
      effectiveHourlyRateCents: memberRate.hourlyRateCents,
      hasCustomRate: true,
      customHourlyRateDisplay: memberRate.hourlyRateCents / 100,
    },
  });
});

/**
 * DELETE /time-entries/project/:projectId/member-rates/:targetUserId
 * Removes custom hourly rate for a team member so they revert to default project rate.
 * Only the company owner or project creator can perform this.
 */
export const deleteProjectMemberRate = catchAsync(async (req, res, next) => {
  const { projectId, targetUserId } = req.params;
  const userId = req.userId;

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { id: true, companyId: true, creatorId: true, hourlyRateCents: true },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  const canManage = await isCompanyOwnerOrProjectCreator(userId, project);
  if (!canManage) {
    return next(
      new HandleERROR(
        "Only the company owner or project creator can remove member hourly rates",
        403
      )
    );
  }

  await prisma.projectMemberRate.deleteMany({
    where: {
      projectId: +projectId,
      userId: +targetUserId,
    },
  });

  await deleteKeysByPattern(`project:${projectId}:*`);

  return res.status(200).json({
    success: true,
    message: "Member custom rate removed. Reverted to project default rate.",
    data: {
      projectId: +projectId,
      userId: +targetUserId,
      customHourlyRateCents: null,
      effectiveHourlyRateCents: project.hourlyRateCents,
      hasCustomRate: false,
    },
  });
});

// ─── Earnings Summaries ───────────────────────────────────────────────────────

/**
 * GET /time-entries/my/earnings
 * Self-scoped earnings summary with optional date filters.
 * Only returns data for the authenticated user — no userId override allowed.
 */
export const getMyEarningsSummary = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { startDate, endDate, projectId } = req.query;

  const where = { userId }; // always locked to self

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) {
      // Include the entire end day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  if (projectId) {
    const access = await checkProjectAccess(userId, +projectId);
    if (!access) {
      return next(new HandleERROR("You do not have access to this project", 403));
    }
    where.projectId = +projectId;
  }

  const [aggregate, byProject] = await Promise.all([
    prisma.timeEntry.aggregate({
      where,
      _sum: { duration: true, earningsCents: true },
      _count: { id: true },
    }),
    prisma.timeEntry.groupBy({
      by: ["projectId"],
      where,
      _sum: { duration: true, earningsCents: true },
      _count: { id: true },
    }),
  ]);

  const projectIds = byProject.map((p) => p.projectId);
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true, currency: true },
  });
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const perProject = byProject.map((item) => {
    const proj = projectMap.get(item.projectId) || { id: item.projectId, name: "Unknown", currency: "USD" };
    return {
      projectId: proj.id,
      projectName: proj.name,
      currency: proj.currency,
      totalMinutes: item._sum.duration || 0,
      totalHours: Math.round(((item._sum.duration || 0) / 60) * 100) / 100,
      totalEarningsCents: item._sum.earningsCents || null,
      entryCount: item._count.id,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Your earnings summary fetched successfully",
    data: {
      totalMinutes: aggregate._sum.duration || 0,
      totalHours: Math.round(((aggregate._sum.duration || 0) / 60) * 100) / 100,
      totalEarningsCents: aggregate._sum.earningsCents || null,
      entryCount: aggregate._count.id || 0,
      byProject: perProject,
    },
  });
});

/**
 * GET /time-entries/project/:projectId/earnings
 * Admin-only project earnings report. Returns per-member hours and earnings.
 * MEMBERS are forbidden — only OWNER/ADMIN of the company may call this.
 */
export const getProjectEarningsReport = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;
  const userId = req.userId;

  const project = await prisma.project.findUnique({
    where: { id: +projectId },
    select: { id: true, name: true, companyId: true, creatorId: true, hourlyRateCents: true, currency: true },
  });

  if (!project) return next(new HandleERROR("Project not found", 404));

  const isOwnerOrCreator = await isCompanyOwnerOrProjectCreator(userId, project);
  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: project.companyId, userId } },
  });
  const isAdmin = companyMember && companyMember.role === "ADMIN";

  if (!isOwnerOrCreator && !isAdmin) {
    return next(
      new HandleERROR(
        "Only company administrators or the project creator can view the project earnings report",
        403
      )
    );
  }

  const where = { projectId: +projectId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const [aggregate, byUser, customRates] = await Promise.all([
    prisma.timeEntry.aggregate({
      where,
      _sum: { duration: true, earningsCents: true },
      _count: { id: true },
    }),
    prisma.timeEntry.groupBy({
      by: ["userId"],
      where,
      _sum: { duration: true, earningsCents: true },
      _count: { id: true },
    }),
    prisma.projectMemberRate.findMany({
      where: { projectId: +projectId },
    }),
  ]);

  const customRateMap = new Map(customRates.map((r) => [r.userId, r.hourlyRateCents]));

  const userIds = byUser.map((u) => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phoneNumber: true, avatar: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const perMember = byUser.map((item) => {
    const user = userMap.get(item.userId) || { id: item.userId, name: "Unknown" };
    const customRate = customRateMap.get(item.userId) ?? null;
    return {
      user,
      customHourlyRateCents: customRate,
      effectiveHourlyRateCents: customRate !== null ? customRate : project.hourlyRateCents,
      totalMinutes: item._sum.duration || 0,
      totalHours: Math.round(((item._sum.duration || 0) / 60) * 100) / 100,
      totalEarningsCents: item._sum.earningsCents || null,
      entryCount: item._count.id,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Project earnings report fetched successfully",
    data: {
      projectId: project.id,
      projectName: project.name,
      currency: project.currency,
      currentHourlyRateCents: project.hourlyRateCents,
      totalMinutes: aggregate._sum.duration || 0,
      totalHours: Math.round(((aggregate._sum.duration || 0) / 60) * 100) / 100,
      totalEarningsCents: aggregate._sum.earningsCents || null,
      entryCount: aggregate._count.id || 0,
      byMember: perMember,
    },
  });
});

export default {
  createTimeEntry,
  getTimeEntries,
  getTimeEntryById,
  updateTimeEntry,
  deleteTimeEntry,
  getTaskTimeSummary,
  getProjectTimeSummary,
  getProjectRate,
  setProjectRate,
  getProjectMemberRates,
  setProjectMemberRate,
  deleteProjectMemberRate,
  getMyEarningsSummary,
  getProjectEarningsReport,
};
