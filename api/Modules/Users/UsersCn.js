import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import redis from "../../config/redis.js";

export const searchUser = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 10 } = req.query;
  const finalLimit = Math.trunc(limit);
  const finalPage = Math.trunc(page);
  const skip = (finalPage - 1) * finalLimit;

  if (!q?.trim()) {
    const msg = req.t ? req.t("validation.queryRequired") : "Search query is required";
    return next(new HandleERROR(msg, 400));
  }

  let users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    take: finalLimit,
    skip: skip,
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      preferredLocale: true,
      createdAt: true,
    },
  });

  const count = await prisma.user.count({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  users = users?.map((item) => {
    if (item.phoneNumber && item.phoneNumber.length >= 11) {
      const p = item.phoneNumber;
      item.phoneNumber = p[0] + "***" + p.slice(-2);
    }
    return item;
  });

  return res.sendLocalized({
    status: 200,
    success: true,
    data: users,
    pagination: {
      page: finalPage,
      limit: finalLimit,
      total: count,
      pages: Math.ceil(count / finalLimit),
    },
  });
});

export const getOne = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const cachedUser = await redis.get(`user:${id}`);
  if (cachedUser) {
    return res.sendLocalized({
      status: 200,
      success: true,
      messageKey: "users.fetchedSuccess",
      data: JSON.parse(cachedUser),
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      preferredLocale: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const msg = req.t ? req.t("users.notFound") : "User not found";
    return next(new HandleERROR(msg, 404));
  }

  if (user.phoneNumber && user.phoneNumber.length >= 11) {
    const p = user.phoneNumber;
    user.phoneNumber = p[0] + "***" + p.slice(-2);
  }

  await redis.set(`user:${id}`, JSON.stringify(user), { EX: 60 * 60 * 24 });

  return res.sendLocalized({
    status: 200,
    success: true,
    messageKey: "users.fetchedSuccess",
    data: user,
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, preferredLocale } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (preferredLocale && ["en", "fa"].includes(preferredLocale)) {
    updateData.preferredLocale = preferredLocale;
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      preferredLocale: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await redis.del(`user:${req.userId}`);
  await redis.set(`user:${req.userId}`, JSON.stringify(updatedUser), { EX: 60 * 60 * 24 });

  // Update response locale if preferredLocale was changed
  if (updatedUser.preferredLocale) {
    req.locale = updatedUser.preferredLocale;
    res.setHeader("Content-Language", updatedUser.preferredLocale);
  }

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "USER_PROFILE_UPDATED",
    messageKey: "users.profileUpdatedSuccess",
    data: updatedUser,
  });
});

export const removeUser = catchAsync(async (req, res, next) => {
  await prisma.user.delete({
    where: { id: req.userId },
  });
  await redis.del(`user:${req.userId}`);

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "USER_ACCOUNT_DELETED",
    messageKey: "users.userDeletedSuccess",
  });
});