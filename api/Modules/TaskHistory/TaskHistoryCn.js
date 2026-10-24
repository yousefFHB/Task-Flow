import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis from "../../config/redis.js";

export const getAllTaskHistory = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.userId;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const task = await prisma.task.findUnique({
    where: { id: +taskId },
    select: {
      id: true,
      projectId: true,
      project: {
        select: {
          id: true,
          teamId: true,
          companyId: true,
        },
      },
    },
  });

  if (!task) {
    return next(new HandleERROR("Task not found", 404));
  }

  // Authorization: user must belong to the team, project, or company
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
    return next(new HandleERROR("You do not have permission to view this task's history", 403));
  }

  const cacheKey = `task:${taskId}:histories:p${page}:l${limit}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Task history fetched successfully",
      ...JSON.parse(cachedData),
    });
  }

  const [histories, totalCount] = await Promise.all([
    prisma.taskHistory.findMany({
      where: { taskId: +taskId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        taskId: true,
        action: true,
        field: true,
        oldValue: true,
        newValue: true,
        createdAt: true,
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
    prisma.taskHistory.count({ where: { taskId: +taskId } }),
  ]);

  const responsePayload = {
    data: histories,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit) || 1,
    },
  };

  try {
    await redis.set(cacheKey, JSON.stringify(responsePayload), { EX: 60 * 10 });
  } catch (err) {
    console.error("Redis set error in getAllTaskHistory:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: "Task history fetched successfully",
    ...responsePayload,
  });
});

export default {
  getAllTaskHistory,
};
