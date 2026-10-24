import express from "express";
import isLogin from "../../MIddlewares/isLogin.js";
import {
  getAllCompany,
  getOne,
  create,
  updateCompany,
  removeCompany,
  leftCompany,
  addOrRemoveMemberCompany,
  updateCompanyRole,
} from "./CompanyCn.js";
import {
  createCompanyValidator,
  updateCompanyValidator,
  listCompanyValidator,
  companyIdValidator,
  memberPhoneValidator,
  updateMemberRoleValidator,
} from "./CompanyValidator.js";

const companyRouter = express.Router();

// All company operations require authentication
companyRouter.use(isLogin);

// List companies for current user or create new company
companyRouter
  .route("/")
  .get(listCompanyValidator, getAllCompany)
  .post(createCompanyValidator, create);

// Single company operations: Get details, Update name, Delete company
companyRouter
  .route("/:id")
  .get(companyIdValidator, getOne)
  .patch(companyIdValidator, updateCompanyValidator, updateCompany)
  .delete(companyIdValidator, removeCompany);

// Leave company (supports both POST and DELETE)
companyRouter
  .route("/:id/leave")
  .post(companyIdValidator, leftCompany)
  .delete(companyIdValidator, leftCompany);

// Add or remove member by phone number
companyRouter.post(
  "/:id/member",
  companyIdValidator,
  memberPhoneValidator,
  addOrRemoveMemberCompany
);

// Update member role (OWNER only)
companyRouter.put(
  "/:id/member/role",
  companyIdValidator,
  updateMemberRoleValidator,
  updateCompanyRole
);

export default companyRouter;
