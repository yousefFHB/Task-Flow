import { catchAsync, HandleERROR } from "vanta-api";
import redis, { deleteKeysByPattern } from "../../config/redis.js";
import prisma from "../../src/config/prisma.js";

export const getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = +req.userId;
  const { page = 1, limit = 10, isRead } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const cacheKey = `user:${userId}:notifications:${JSON.stringify({ page: pageNum, limit: limitNum, isRead })}`;
  const cacheData = await redis.get(cacheKey);

  if (cacheData) {
    return res.status(200).json({
      success: true,
      message: req.t ? req.t("notifications.fetchedSuccess") : "Notifications fetched successfully",
      data: JSON.parse(cacheData),
    });
  }
  const [notifications, count] = await prisma.$transaction([
    prisma.notification.findMany({
      where: {
        userId,
        ...(isRead != undefined && {
          isRead: isRead == "true" || isRead == true,
        }),
      },
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        createdAt: true,
        taskId: true,
        projectId: true,
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        isRead: true,
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        ...(isRead != undefined && {
          isRead: isRead == "true" || isRead == true,
        }),
      },
    }),
  ]);
  const response = {
    data: notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      pages: Math.ceil(count / limitNum),
    },
  };
  await redis.set(cacheKey, JSON.stringify(response), { EX: 60 * 60 });
  return res.status(200).json({
    success: true,
    message: req.t ? req.t("notifications.fetchedSuccess") : "Notifications fetched successfully",
    data: response,
  });
});

export const getUnreadNotificationCount = catchAsync(async (req, res, next) => {
  const userId = +req.userId;
  const cacheKey = `user:${userId}:notifications:unread_count`;
  const cacheData = await redis.get(cacheKey);
  if (cacheData) {
    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: JSON.parse(cacheData),
    });
  }
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
  await redis.set(cacheKey, JSON.stringify(count), { EX: 60 * 60 });
  return res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: count,
  });
});

export const markAsRead = catchAsync(async (req, res, next) => {
  const userId = +req.userId;
  const { id } = req.params;
  if (!id) {
    return next(new HandleERROR("Notification id is required", 400));
  }
  const notification = await prisma.notification.findFirst({
    where: {
      id: +id,
      userId,
    },
  });
  if (!notification) {
    return next(new HandleERROR("Notification not found", 404));
  }
  await prisma.notification.update({
    where: {
      id: +id,
    },
    data: {
      isRead: true,
    },
  });
  const cacheKey = `user:${userId}:notifications:unread_count`;
  const cacheKey2 = `user:${userId}:notifications:*`;
  await redis.del(cacheKey);
  await deleteKeysByPattern(cacheKey2);
  return res.status(200).json({
    success: true,
    message: req.t ? req.t("notifications.markedReadSuccess") : "Notification marked as read successfully",
    data: notification,
  });
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = +req.userId;
  await prisma.notification.updateMany({
    where: {
      userId,
    },
    data: {
      isRead: true,
    },
  });
  const cacheKey = `user:${userId}:notifications:unread_count`;
  const cacheKey2 = `user:${userId}:notifications:*`;
  await redis.del(cacheKey);
  await deleteKeysByPattern(cacheKey2);
  return res.status(200).json({
    success: true,
    message: req.t ? req.t("notifications.markedAllReadSuccess") : "All notifications marked as read successfully",
    data: null,
  });
});

export const deleteNotification = catchAsync(async (req, res, next) => {
  const userId = +req.userId;
  const { id } = req.params;
  if (!id) {
    return next(new HandleERROR("Notification id is required", 400));
  }
  const notification = await prisma.notification.findFirst({
    where: {
      id: +id,
      userId,
    },
  });
  if (!notification) {
    return next(new HandleERROR("Notification not found", 404));
  }
  await prisma.notification.delete({
    where: {
      id: +id,
    },
  });
  const cacheKey = `user:${userId}:notifications:unread_count`;
  const cacheKey2 = `user:${userId}:notifications:*`;
  await redis.del(cacheKey);
  await deleteKeysByPattern(cacheKey2);
  return res.status(200).json({
    success: true,
    message: req.t ? req.t("notifications.deletedSuccess") : "Notification deleted successfully",
    data: notification,
  });
});
