import express from "express";
import { getAllTaskHistory } from "./TaskHistoryCn.js";
import { taskIdParamValidator } from "./TaskHistoryValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const taskHistoryRouter = express.Router();

taskHistoryRouter.use(isLogin);

// Get task histories by task ID (supports both /:taskId and /task/:taskId)
taskHistoryRouter
  .route("/task/:taskId")
  .get(taskIdParamValidator, getAllTaskHistory);

taskHistoryRouter
  .route("/:taskId")
  .get(taskIdParamValidator, getAllTaskHistory);

export default taskHistoryRouter;
