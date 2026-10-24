import { catchAsync, HandleERROR } from "vanta-api";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import prisma from "../../src/config/prisma.js";

export const getAllProject = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const cacheKey = `user:${userId}:projects`;
  const cacheData = await redis.get(cacheKey);

  if (cacheData) {
    return res.status(200).json({
      success: true,
      message: req.t ? req.t("projects.fetchedSuccess") : "Projects fetched successfully",
      data: JSON.parse(cacheData),
    });
  }

  // Find teams user belongs to
  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMembers.map((item) => item.teamId);

  // Also check project memberships
  const projectMembers = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const projectIds = projectMembers.map((item) => item.projectId);

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { teamId: { in: teamIds } },
        { id: { in: projectIds } },
      ],
    },
    include: {
      team: {
        select: { id: true, name: true },
      },
      company: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          timeEntries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    await redis.set(cacheKey, JSON.stringify(projects), { EX: 60 * 10 });
  } catch (err) {
    console.error("Redis set error in getAllProject:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("projects.fetchedSuccess") : "Projects fetched successfully",
    data: projects,
  });
});

export const getOne = catchAsync(async (req, res, next) => {
  const id = +req.params.id;
  const userId = req.userId;
  const cacheKey = `project:${id}:user:${userId}`;

  const cacheData = await redis.get(cacheKey);
  if (cacheData) {
    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: JSON.parse(cacheData),
    });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          members: {
            include: {
              user: {
                select: { id: true, name: true, phoneNumber: true, avatar: true },
              },
            },
          },
        },
      },
      company: {
        select: { id: true, name: true, slug: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, phoneNumber: true, avatar: true },
          },
        },
      },
      tasks: {
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          assignee: {
            select: { id: true, name: true, phoneNumber: true, avatar: true },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          timeEntries: true,
        },
      },
    },
  });

  if (!project) {
    return next(new HandleERROR("Project not found", 404));
  }

  const [teamMember, projectMember, companyMember] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId } },
    }),
    prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    }),
    prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId: project.companyId, userId } },
    }),
  ]);

  if (!teamMember && !projectMember && !companyMember) {
    return next(new HandleERROR("You do not have access to this project", 403));
  }

  // Calculate total time logged across project
  const timeAggregate = await prisma.timeEntry.aggregate({
    where: { projectId: id },
    _sum: { duration: true },
  });

  const projectWithTotalTime = {
    ...project,
    totalLoggedMinutes: timeAggregate._sum.duration || 0,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(projectWithTotalTime), { EX: 60 * 10 });
  } catch (err) {
    console.error("Redis set error in getOne project:", err.message || err);
  }

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("projects.fetchedSuccess") : "Project fetched successfully",
    data: projectWithTotalTime,
  });
});

export const getAllProjectByCompanyId = catchAsync(async (req, res, next) => {
  const companyId = +req.params.companyId;
  const userId = req.userId;

  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });

  if (!companyMember) {
    return next(new HandleERROR("You are not a member of this company", 403));
  }

  const projects = await prisma.project.findMany({
    where: { companyId },
    include: {
      team: { select: { id: true, name: true } },
      _count: {
        select: {
          tasks: true,
          members: true,
          timeEntries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    success: true,
    message: "Company projects fetched successfully",
    data: projects,
  });
});

export const createProject = catchAsync(async (req, res, next) => {
  const { name, teamId, companyId, description = "", deadline = null } = req.body;
  const userId = req.userId;

  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: +companyId, userId } },
  });

  if (!companyMember) {
    return next(new HandleERROR("You are not a member of this company", 403));
  }
  if (companyMember.role === "MEMBER") {
    return next(new HandleERROR("You are not authorized to create a project in this company", 403));
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      teamId: +teamId,
      companyId: +companyId,
      creatorId: userId,
      description: description?.trim() || null,
      deadLine: deadline ? new Date(deadline) : null,
    },
    include: {
      team: { select: { id: true, name: true } },
    },
  });

  await deleteKeysByPattern(`user:*:projects`);
  await deleteKeysByPattern(`company:${companyId}:projects:*`);

  return res.status(201).json({
    success: true,
    message: req.t ? req.t("projects.createdSuccess") : "Project created successfully",
    data: project,
  });
});

export const updateProject = catchAsync(async (req, res, next) => {
  const id = +req.params.id;
  const { name, description, deadline, teamId } = req.body;
  const userId = req.userId;

  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return next(new HandleERROR("Project not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: existingProject.companyId, userId } },
  });

  if (!companyMember || companyMember.role === "MEMBER") {
    return next(new HandleERROR("You are not authorized to update this project", 403));
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(deadline !== undefined && { deadLine: deadline ? new Date(deadline) : null }),
      ...(teamId && { teamId: +teamId }),
    },
  });

  await deleteKeysByPattern(`project:${id}:*`);
  await deleteKeysByPattern(`user:*:projects`);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("projects.updatedSuccess") : "Project updated successfully",
    data: updatedProject,
  });
});

export const deleteProject = catchAsync(async (req, res, next) => {
  const id = +req.params.id;
  const userId = req.userId;

  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return next(new HandleERROR("Project not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: existingProject.companyId, userId } },
  });

  if (!companyMember || companyMember.role === "MEMBER") {
    return next(new HandleERROR("You are not authorized to delete this project", 403));
  }

  const deletedProject = await prisma.project.delete({
    where: { id },
  });

  await deleteKeysByPattern(`project:${id}:*`);
  await deleteKeysByPattern(`user:*:projects`);

  return res.status(200).json({
    success: true,
    message: req.t ? req.t("projects.deletedSuccess") : "Project deleted successfully",
    data: deletedProject,
  });
});

export default {
  getAllProject,
  getOne,
  getAllProjectByCompanyId,
  createProject,
  updateProject,
  deleteProject,
};