import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res.status(400).json({
      success: false,
      message: errorList[0].msg,
      errors: errorList.map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const projectIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const companyIdParamValidator = [
  param("companyId")
    .isInt({ min: 1 })
    .withMessage("شناسه شرکت باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام پروژه الزامی است")
    .isLength({ min: 2, max: 100 })
    .withMessage("نام پروژه باید بین ۲ تا ۱۰۰ کاراکتر باشد"),
  body("companyId")
    .notEmpty()
    .withMessage("شناسه شرکت الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه شرکت باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("teamId")
    .notEmpty()
    .withMessage("شناسه تیم الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("description")
    .optional()
    .trim(),
  body("deadline")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("فرمت تاریخ تحویل نامعتبر است"),
  validate,
];

export const updateProjectValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("نام پروژه نمی‌تواند خالی باشد")
    .isLength({ min: 2, max: 100 })
    .withMessage("نام پروژه باید بین ۲ تا ۱۰۰ کاراکتر باشد"),
  body("teamId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("description")
    .optional()
    .trim(),
  body("deadline")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("فرمت تاریخ تحویل نامعتبر است"),
  validate,
];

export default {
  projectIdValidator,
  companyIdParamValidator,
  createProjectValidator,
  updateProjectValidator,
  validate,
};
