import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../../Utils/handleValidationError.js";

export const searchUserValidator = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("validation.queryRequired"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("validation.pageInvalid")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("validation.limitInvalid")
    .toInt(),
  handleValidationErrors,
];

export const getOneValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("validation.idInvalid")
    .toInt(),
  handleValidationErrors,
];

export const getUserByIdValidator = getOneValidator;

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("validation.nameCannotBeEmpty")
    .isLength({ min: 2, max: 50 })
    .withMessage("validation.nameLength"),
  body("preferredLocale")
    .optional()
    .isIn(["en", "fa"])
    .withMessage("validation.localeInvalid"),
  handleValidationErrors,
];

export const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("validation.nameCannotBeEmpty")
    .isLength({ min: 2, max: 50 })
    .withMessage("validation.nameLength"),
  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  body("preferredLocale")
    .optional()
    .isIn(["en", "fa"])
    .withMessage("validation.localeInvalid"),
  handleValidationErrors,
];

export const validate = handleValidationErrors;
