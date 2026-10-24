import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../../Utils/handleValidationError.js";

// Create company – name is required, slug will be generated server-side
export const createCompanyValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("validation.companyNameRequired")
    .isLength({ min: 2, max: 100 })
    .withMessage("validation.companyNameLength"),
  handleValidationErrors,
];

// Update company – optional name field
export const updateCompanyValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("validation.companyNameLength"),
  handleValidationErrors,
];

// Query validators for listing companies
export const listCompanyValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("validation.pageInvalid"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("validation.limitInvalid"),
  query("q")
    .optional()
    .trim(),
  query("sort")
    .optional()
    .isString()
    .withMessage("validation.sortInvalid"),
  handleValidationErrors,
];

// Validate company id param
export const companyIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .toInt()
    .withMessage("validation.idInvalid"),
  handleValidationErrors,
];

// Add / remove member – phone number required
export const memberPhoneValidator = [
  body("phoneNumber")
    .trim()
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  handleValidationErrors,
];

// Update member role – memberId and role required
export const updateMemberRoleValidator = [
  body("memberId")
    .isInt({ min: 1 })
    .toInt()
    .withMessage("validation.idInvalid"),
  body("role")
    .isIn(["OWNER", "ADMIN", "MEMBER"])
    .withMessage("validation.roleInvalid"),
  handleValidationErrors,
];

export default {
  createCompanyValidator,
  updateCompanyValidator,
  listCompanyValidator,
  companyIdValidator,
  memberPhoneValidator,
  updateMemberRoleValidator,
};
