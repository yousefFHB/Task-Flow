import express from "express";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./NotificationCn.js";
import {
  notificationIdValidator,
  getMyNotificationsValidator,
} from "./notificationValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const notificationRouter = express.Router();

notificationRouter.use(isLogin);

// List current user's notifications
notificationRouter
  .route("/")
  .get(getMyNotificationsValidator, getMyNotifications);

// Alias for getting current user's notifications
notificationRouter
  .route("/my")
  .get(getMyNotificationsValidator, getMyNotifications);

// Get unread notification count
notificationRouter
  .route("/unread-count")
  .get(getUnreadNotificationCount);

// Mark all notifications as read
notificationRouter
  .route("/read-all")
  .patch(markAllAsRead)
  .put(markAllAsRead);

// Mark a single notification as read (using /:id/read)
notificationRouter
  .route("/:id/read")
  .patch(notificationIdValidator, markAsRead)
  .put(notificationIdValidator, markAsRead);

// Mark as read (PATCH/PUT) or delete (DELETE) by ID
notificationRouter
  .route("/:id")
  .patch(notificationIdValidator, markAsRead)
  .put(notificationIdValidator, markAsRead)
  .delete(notificationIdValidator, deleteNotification);

export default notificationRouter;
