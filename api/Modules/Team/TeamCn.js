import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis, { deleteKeysByPattern } from "../../config/redis.js";

export const getAll = catchAsync(async (req, res, next) => {
  const userId = Number(req.userId);
  const cacheKey = `user:${userId}:teams`;

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Teams fetched successfully",
      data: JSON.parse(cachedData),
    });
  }

  const allMyTeam = await prisma.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      joinedAt: true,
      team: {
        select: {
          id: true,
          name: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  await redis.set(cacheKey, JSON.stringify(allMyTeam), { EX: 60 * 60 });

  return res.status(200).json({
    success: true,
    message: "Teams fetched successfully",
    data: allMyTeam,
  });
});

export const getOneTeam = catchAsync(async (req, res, next) => {
  const teamId = Number(req.params.id);
  const userId = Number(req.userId);

  if (isNaN(teamId)) {
    return next(new HandleERROR("invalid team id", 400));
  }

  const cacheKey = `team:${teamId}:user:${userId}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Team fetched successfully",
      data: JSON.parse(cachedData),
    });
  }

  const team = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId },
    },
    select: {
      id: true,
      joinedAt: true,
      team: {
        select: {
          id: true,
          name: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
          members: {
            select: {
              id: true,
              joinedAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!team) {
    return next(new HandleERROR("Team not found", 404));
  }

  await redis.set(cacheKey, JSON.stringify(team), { EX: 60 * 60 });

  return res.status(200).json({
    success: true,
    message: "Team fetched successfully",
    data: team,
  });
});

export const getAllMyCompanyTeam = catchAsync(async (req, res, next) => {
  const companyId = Number(req.params.companyId);
  const userId = Number(req.userId);

  if (isNaN(companyId)) {
    return next(new HandleERROR("invalid company id", 400));
  }

  const cacheKey = `company:${companyId}:teams:user:${userId}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Teams fetched successfully",
      data: JSON.parse(cachedData),
    });
  }

  const company = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId, userId },
    },
  });
  if (!company) {
    return next(new HandleERROR("Company not found", 404));
  }
  if (company.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to get all teams of this company", 403),
    );
  }

  const teams = await prisma.team.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
      members: {
        select: {
          id: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
  });

  await redis.set(cacheKey, JSON.stringify(teams), { EX: 60 * 60 });

  return res.status(200).json({
    success: true,
    message: "Teams fetched successfully",
    data: teams,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name, companyId } = req.body;
  const numCompanyId = Number(companyId);
  const userId = Number(req.userId);

  if (isNaN(numCompanyId)) {
    return next(new HandleERROR("invalid company id", 400));
  }

  const company = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: numCompanyId, userId },
    },
  });
  if (!company) {
    return next(new HandleERROR("Company not found", 404));
  }
  if (company.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to create a team in this company", 403),
    );
  }

  const team = await prisma.team.create({
    data: {
      name,
      companyId: numCompanyId,
      members: {
        create: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await deleteKeysByPattern(`user:${userId}:teams*`);
  await deleteKeysByPattern(`company:${numCompanyId}:teams:*`);

  return res.status(200).json({
    success: true,
    message: "Team created successfully",
    data: team,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const teamId = Number(req.params.id);
  const userId = Number(req.userId);
  const { name } = req.body;

  if (isNaN(teamId)) {
    return next(new HandleERROR("invalid team id", 400));
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  if (!team) {
    return next(new HandleERROR("Team not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: team.companyId, userId },
    },
  });
  if (!companyMember || companyMember.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to update this team", 403),
    );
  }

  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: { name },
    select: {
      id: true,
      name: true,
      companyId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await deleteKeysByPattern(`team:${teamId}:*`);
  await deleteKeysByPattern(`company:${team.companyId}:teams:*`);
  await deleteKeysByPattern("user:*:teams*");

  return res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: updatedTeam,
  });
});

export const remove = catchAsync(async (req, res, next) => {
  const teamId = Number(req.params.id);
  const userId = Number(req.userId);

  if (isNaN(teamId)) {
    return next(new HandleERROR("invalid team id", 400));
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  if (!team) {
    return next(new HandleERROR("Team not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: team.companyId, userId },
    },
  });
  if (!companyMember || companyMember.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to remove this team", 403),
    );
  }

  await prisma.team.delete({
    where: { id: teamId },
  });

  await deleteKeysByPattern(`team:${teamId}:*`);
  await deleteKeysByPattern(`company:${team.companyId}:teams:*`);
  await deleteKeysByPattern("user:*:teams*");

  return res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});

export const addMember = catchAsync(async (req, res, next) => {
  const teamId = Number(req.params.id);
  const userId = Number(req.userId);
  const { phoneNumber } = req.body;

  if (isNaN(teamId)) {
    return next(new HandleERROR("invalid team id", 400));
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  if (!team) {
    return next(new HandleERROR("Team not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: team.companyId, userId },
    },
  });
  if (!companyMember || companyMember.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to add a member to this team", 403),
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { phoneNumber },
  });
  if (!targetUser) {
    return next(new HandleERROR("User not found", 404));
  }

  const targetCompanyMember = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: team.companyId, userId: targetUser.id },
    },
  });
  if (!targetCompanyMember) {
    return next(
      new HandleERROR("Target user is not a member of this company", 400),
    );
  }

  const existingTeamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId: targetUser.id },
    },
  });
  if (existingTeamMember) {
    return next(new HandleERROR("User is already in this team", 400));
  }

  const member = await prisma.teamMember.create({
    data: {
      teamId,
      userId: targetUser.id,
    },
    select: {
      id: true,
      teamId: true,
      userId: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      },
    },
  });

  await deleteKeysByPattern(`team:${teamId}:*`);
  await deleteKeysByPattern(`company:${team.companyId}:teams:*`);
  await deleteKeysByPattern(`user:${targetUser.id}:teams*`);

  return res.status(200).json({
    success: true,
    message: "Member added to team successfully",
    data: member,
  });
});

export const removeMember = catchAsync(async (req, res, next) => {
  const teamId = Number(req.params.id);
  const memberId = Number(req.body.memberId);
  const userId = Number(req.userId);

  if (isNaN(teamId) || isNaN(memberId)) {
    return next(new HandleERROR("invalid team or member id", 400));
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  if (!team) {
    return next(new HandleERROR("Team not found", 404));
  }

  const companyMember = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: team.companyId, userId },
    },
  });
  if (!companyMember || companyMember.role === "MEMBER") {
    return next(
      new HandleERROR("You are not authorized to remove a member from this team", 403),
    );
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId: memberId },
    },
  });
  if (!existingMember) {
    return next(new HandleERROR("Team member not found", 404));
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: { teamId, userId: memberId },
    },
  });

  await deleteKeysByPattern(`team:${teamId}:*`);
  await deleteKeysByPattern(`company:${team.companyId}:teams:*`);
  await deleteKeysByPattern(`user:${memberId}:teams*`);

  return res.status(200).json({
    success: true,
    message: "Member removed from team successfully",
  });
});


