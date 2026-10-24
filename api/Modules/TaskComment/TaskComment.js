import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./TaskCommentCn.js";
import {
  createCommentValidator,
  updateCommentValidator,
  commentIdValidator,
  getTaskCommentsValidator,
} from "./TaskCommentValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const taskCommentRouter = express.Router();

// All comment routes require authentication
taskCommentRouter.use(isLogin);

// Create comment (direct / or nested under /task/:taskId)
taskCommentRouter
  .route("/")
  .post(createCommentValidator, createComment);

taskCommentRouter
  .route("/task/:taskId")
  .get(getTaskCommentsValidator, getComments)
  .post(createCommentValidator, createComment);

// Update or delete single comment
taskCommentRouter
  .route("/:id")
  .patch(updateCommentValidator, updateComment)
  .put(updateCommentValidator, updateComment)
  .delete(commentIdValidator, deleteComment);

export default taskCommentRouter;
