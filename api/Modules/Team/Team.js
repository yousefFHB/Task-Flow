import express from "express";
import {
  getAll,
  getOneTeam,
  getAllMyCompanyTeam,
  create,
  update,
  remove,
  addMember,
  removeMember,
} from "./TeamCn.js";
import {
  teamIdValidator,
  companyIdParamValidator,
  createTeamValidator,
  updateTeamValidator,
  addMemberValidator,
  removeMemberValidator,
} from "./teamValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const teamRouter = express.Router();

// Require login for all team operations
teamRouter.use(isLogin);

// List user's teams & Create a new team
teamRouter
  .route("/")
  .get(getAll)
  .post(createTeamValidator, create);

// List all teams belonging to a specific company
teamRouter
  .route("/company/:companyId")
  .get(companyIdParamValidator, getAllMyCompanyTeam);

// Get, update, and delete a specific team by id
teamRouter
  .route("/:id")
  .get(teamIdValidator, getOneTeam)
  .patch(updateTeamValidator, update)
  .put(updateTeamValidator, update)
  .delete(teamIdValidator, remove);

// Manage team members (add via POST, remove via DELETE)
teamRouter
  .route("/:id/member")
  .post(addMemberValidator, addMember)
  .delete(removeMemberValidator, removeMember);

export default teamRouter;
