import express from "express";
import {
  getMyTasks,
  getOneTask,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
} from "./taskCn.js";
import {
  taskIdValidator,
  getMyTasksValidator,
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
} from "./taskValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const taskRouter = express.Router();

taskRouter.use(isLogin);

// List user's tasks & Create a new task
taskRouter
  .route("/")
  .get(getMyTasksValidator, getMyTasks)
  .post(createTaskValidator, createTask);

// Alias to get current user's tasks
taskRouter.route("/my").get(getMyTasksValidator, getMyTasks);

// Update status specifically
taskRouter
  .route("/:id/status")
  .patch(updateTaskStatusValidator, updateStatus)
  .put(updateTaskStatusValidator, updateStatus);

// Get, update, and delete a single task by ID
taskRouter
  .route("/:id")
  .get(taskIdValidator, getOneTask)
  .patch(updateTaskValidator, updateTask)
  .put(updateTaskValidator, updateTask)
  .delete(taskIdValidator, deleteTask);

export default taskRouter;
