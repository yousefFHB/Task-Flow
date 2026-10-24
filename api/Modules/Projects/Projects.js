import express from "express";
import {
  getAllProject,
  getOne,
  getAllProjectByCompanyId,
  createProject,
  updateProject,
  deleteProject,
} from "./ProjectsCn.js";
import {
  projectIdValidator,
  companyIdParamValidator,
  createProjectValidator,
  updateProjectValidator,
} from "./ProjectsValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const projectRouter = express.Router();

projectRouter.use(isLogin);

// List user's projects & create new project
projectRouter
  .route("/")
  .get(getAllProject)
  .post(createProjectValidator, createProject);

// List projects by company
projectRouter
  .route("/company/:companyId")
  .get(companyIdParamValidator, getAllProjectByCompanyId);

// Single project operations: get, update, delete
projectRouter
  .route("/:id")
  .get(projectIdValidator, getOne)
  .patch(updateProjectValidator, updateProject)
  .put(updateProjectValidator, updateProject)
  .delete(projectIdValidator, deleteProject);

export default projectRouter;
