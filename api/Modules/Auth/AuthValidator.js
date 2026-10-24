import { body } from "express-validator";
import { handleValidationError } from "../../Utils/handleValidationError.js";

export const loginValidator = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("validation.phoneRequired")
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  body("password")
    .notEmpty()
    .withMessage("validation.passwordRequired")
    .isLength({ min: 6 })
    .withMessage("validation.passwordLength"),
  handleValidationError,
];

export const registerValidator = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("validation.phoneRequired")
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  body("password")
    .notEmpty()
    .withMessage("validation.passwordRequired")
    .isLength({ min: 6 })
    .withMessage("validation.passwordLength"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("validation.nameCannotBeEmpty"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("validation.codeRequired")
    .isLength({ min: 4, max: 6 })
    .withMessage("validation.codeLength"),
  handleValidationError,
];

export const forgetPasswordValidator = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("validation.phoneRequired")
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("validation.codeRequired")
    .isLength({ min: 4, max: 6 })
    .withMessage("validation.codeLength"),
  body("newPassword")
    .notEmpty()
    .withMessage("validation.passwordRequired")
    .isLength({ min: 6 })
    .withMessage("validation.passwordLength"),
  handleValidationError,
];

export const resendCodeValidator = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("validation.phoneRequired")
    .matches(/^09\d{9}$/)
    .withMessage("validation.phoneInvalid"),
  handleValidationError,
];
