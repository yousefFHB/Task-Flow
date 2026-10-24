import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis from "../../config/redis.js";
import { v4 } from "uuid";

// Helper to invalidate cached queries for a user or company
async function invalidateCompanyCache(userId, companyId) {
  try {
    if (!redis.isOpen) return;
    const patterns = [];
    if (userId) patterns.push(`user:${userId}:companies:*`);
    if (companyId) {
      patterns.push(`company:${companyId}:*`);
      // Also invalidate company member caches
      const members = await prisma.companyMember.findMany({
        where: { companyId: Number(companyId) },
        select: { userId: true },
      });
      for (const m of members) {
        patterns.push(`user:${m.userId}:companies:*`);
      }
    }

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys && keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (err) {
    console.error("Cache invalidation error:", err.message || err);
  }
}

// ─── GET /api/companies (List all companies for current user) ─────────────────
export const getAllCompany = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const finalLimit = Math.max(1, Math.min(100, Math.trunc(Number(limit)) || 10));
  const finalPage = Math.max(1, Math.trunc(Number(page)) || 1);
  const skip = (finalPage - 1) * finalLimit;
  const userId = req.userId;
  const search = req.query?.q ? String(req.query.q).trim() : "";
  const allowedSortFields = ["joinedAt", "name", "createdAt", "role"];
  const sort = req.query?.sort || "joinedAt";
  const sortFields = sort.startsWith("-") ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith("-") ? "desc" : "asc";

  if (!allowedSortFields.includes(sortFields)) {
    return next(new HandleERROR("validation.sortInvalid", 400));
  }

  const cacheKey = `user:${userId}:companies:${JSON.stringify({
    page: finalPage,
    limit: finalLimit,
    sort,
    search,
  })}`;

  try {
    if (redis.isOpen) {
      const cacheData = await redis.get(cacheKey);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        return res.sendLocalized({
          status: 200,
          success: true,
          messageKey: "system.healthy",
          data: parsed.companies,
          pagination: parsed.pagination,
        });
      }
    }
  } catch {
    // Proceed without cache on redis error
  }

  const where = {
    userId,
    ...(search
      ? { company: { name: { contains: search, mode: "insensitive" } } }
      : {}),
  };

  const sortMap = {
    joinedAt: { joinedAt: sortOrder },
    name: { company: { name: sortOrder } },
    createdAt: { company: { createdAt: sortOrder } },
    role: { role: sortOrder },
  };

  const [memberships, count] = await prisma.$transaction([
    prisma.companyMember.findMany({
      where,
      select: {
        id: true,
        role: true,
        joinedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                companyMembers: true,
                teams: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: sortMap[sortFields],
      skip,
      take: finalLimit,
    }),
    prisma.companyMember.count({ where }),
  ]);

  const pagination = {
    page: finalPage,
    limit: finalLimit,
    total: count,
    pages: Math.ceil(count / finalLimit) || 1,
  };

  try {
    if (redis.isOpen) {
      await redis.set(
        cacheKey,
        JSON.stringify({ companies: memberships, pagination }),
        { EX: 60 * 15 } // 15 mins cache
      );
    }
  } catch {
    // Ignore cache error
  }

  return res.sendLocalized({
    status: 200,
    success: true,
    messageKey: "system.healthy",
    data: memberships,
    pagination,
  });
});

// ─── GET /api/companies/:id (Get single company details & members) ─────────────
export const getOne = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;

  const cacheKey = `company:${numId}:user:${userId}`;
  try {
    if (redis.isOpen) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.sendLocalized({
          status: 200,
          success: true,
          messageKey: "system.healthy",
          data: JSON.parse(cached),
        });
      }
    }
  } catch {
    // Proceed
  }

  const membership = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId: numId, userId },
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              companyMembers: true,
              teams: true,
              projects: true,
            },
          },
          companyMembers: {
            select: {
              id: true,
              role: true,
              joinedAt: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                  avatar: true,
                },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) {
    const err = new HandleERROR("company.notFound", 404);
    err.code = "COMPANY_NOT_FOUND";
    return next(err);
  }

  try {
    if (redis.isOpen) {
      await redis.set(cacheKey, JSON.stringify(membership), { EX: 60 * 15 });
    }
  } catch {
    // Ignore
  }

  return res.sendLocalized({
    status: 200,
    success: true,
    messageKey: "system.healthy",
    data: membership,
  });
});

// ─── POST /api/companies (Create new company with current user as OWNER) ──────
export const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.userId;
  const slug = v4().replaceAll("-", "");

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      creatorId: userId,
      companyMembers: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      companyMembers: {
        select: {
          id: true,
          role: true,
          joinedAt: true,
          userId: true,
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

  await invalidateCompanyCache(userId, company.id);

  return res.sendLocalized({
    status: 201,
    success: true,
    code: "COMPANY_CREATED",
    messageKey: "company.createdSuccess",
    data: company,
  });
});

// ─── PATCH /api/companies/:id (Update company name - OWNER only) ──────────────
export const updateCompany = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;
  const { name } = req.body;

  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: numId, userId } },
  });

  if (!membership || membership.role !== "OWNER") {
    const err = new HandleERROR("auth.unauthorized", 403);
    err.code = "AUTH_FORBIDDEN";
    return next(err);
  }

  const updatedCompany = await prisma.company.update({
    where: { id: numId },
    data: {
      ...(name ? { name: name.trim() } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await invalidateCompanyCache(userId, numId);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "COMPANY_UPDATED",
    messageKey: "company.updatedSuccess",
    data: updatedCompany,
  });
});

// ─── DELETE /api/companies/:id (Delete company - OWNER only) ──────────────────
export const removeCompany = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;

  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: numId, userId } },
  });

  if (!membership || membership.role !== "OWNER") {
    const err = new HandleERROR("auth.unauthorized", 403);
    err.code = "AUTH_FORBIDDEN";
    return next(err);
  }

  await prisma.company.delete({
    where: { id: numId },
  });

  await invalidateCompanyCache(userId, numId);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "COMPANY_DELETED",
    messageKey: "company.deletedSuccess",
  });
});

// ─── POST/DELETE /api/companies/:id/leave (Member leaves company) ─────────────
export const leftCompany = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;

  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: numId, userId } },
  });

  if (!membership) {
    const err = new HandleERROR("company.notFound", 404);
    err.code = "COMPANY_NOT_FOUND";
    return next(err);
  }

  if (membership.role === "OWNER") {
    const err = new HandleERROR("company.cannotLeaveAsOwner", 400);
    err.code = "COMPANY_OWNER_CANNOT_LEAVE";
    return next(err);
  }

  await prisma.companyMember.delete({
    where: { companyId_userId: { companyId: numId, userId } },
  });

  await invalidateCompanyCache(userId, numId);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "COMPANY_LEFT_SUCCESS",
    messageKey: "company.leftSuccess",
  });
});

// ─── POST /api/companies/:id/member (Add or Remove member by phone number) ────
export const addOrRemoveMemberCompany = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;
  const { phoneNumber } = req.body;

  const targetUser = await prisma.user.findUnique({
    where: { phoneNumber: phoneNumber.trim() },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
    },
  });

  if (!targetUser) {
    const err = new HandleERROR("auth.userNotFound", 404);
    err.code = "USER_NOT_FOUND";
    return next(err);
  }

  const company = await prisma.company.findUnique({
    where: { id: numId },
    select: {
      companyMembers: true,
    },
  });

  if (!company) {
    const err = new HandleERROR("company.notFound", 404);
    err.code = "COMPANY_NOT_FOUND";
    return next(err);
  }

  const callerMembership = company.companyMembers.find((m) => m.userId === userId);
  if (!callerMembership || callerMembership.role === "MEMBER") {
    const err = new HandleERROR("auth.unauthorized", 403);
    err.code = "AUTH_FORBIDDEN";
    return next(err);
  }

  const targetMembership = company.companyMembers.find((m) => m.userId === targetUser.id);

  // If member already exists -> remove them
  if (targetMembership) {
    if (targetMembership.role === "OWNER") {
      const err = new HandleERROR("auth.unauthorized", 400);
      err.code = "CANNOT_REMOVE_OWNER";
      return next(err);
    }
    if (callerMembership.role === "ADMIN" && targetMembership.role !== "MEMBER") {
      const err = new HandleERROR("auth.unauthorized", 403);
      err.code = "ADMIN_CANNOT_REMOVE_ADMIN_OR_OWNER";
      return next(err);
    }

    await prisma.companyMember.delete({
      where: { companyId_userId: { companyId: numId, userId: targetUser.id } },
    });

    await invalidateCompanyCache(targetUser.id, numId);

    return res.sendLocalized({
      status: 200,
      success: true,
      code: "COMPANY_MEMBER_REMOVED",
      messageKey: "company.memberRemoved",
      data: { action: "removed", userId: targetUser.id },
    });
  }

  // If member does not exist -> add them
  const newMember = await prisma.companyMember.create({
    data: {
      companyId: numId,
      userId: targetUser.id,
      role: "MEMBER",
    },
    select: {
      id: true,
      role: true,
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

  await invalidateCompanyCache(targetUser.id, numId);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "COMPANY_MEMBER_ADDED",
    messageKey: "company.memberAdded",
    data: { action: "added", member: newMember },
  });
});

// ─── PUT /api/companies/:id/member/role (Update member role - OWNER only) ─────
export const updateCompanyRole = catchAsync(async (req, res, next) => {
  const numId = Number(req.params.id);
  const userId = req.userId;
  const { memberId, role } = req.body;
  const targetUserId = Number(memberId);

  const callerMembership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId: numId, userId } },
  });

  if (!callerMembership || callerMembership.role !== "OWNER") {
    const err = new HandleERROR("auth.unauthorized", 403);
    err.code = "AUTH_FORBIDDEN";
    return next(err);
  }

  const updatedMembership = await prisma.companyMember.update({
    where: { companyId_userId: { companyId: numId, userId: targetUserId } },
    data: { role },
    select: {
      id: true,
      role: true,
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

  await invalidateCompanyCache(targetUserId, numId);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "COMPANY_ROLE_UPDATED",
    messageKey: "company.roleUpdated",
    data: updatedMembership,
  });
});

export default {
  getAllCompany,
  getOne,
  create,
  updateCompany,
  removeCompany,
  leftCompany,
  addOrRemoveMemberCompany,
  updateCompanyRole,
};
