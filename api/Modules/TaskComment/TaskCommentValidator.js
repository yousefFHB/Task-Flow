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

export const createCommentValidator = [
  body("taskId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  param("taskId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("متن نظر الزامی است")
    .isLength({ min: 1, max: 2000 })
    .withMessage("متن نظر باید بین ۱ تا ۲۰۰۰ کاراکتر باشد"),
  validate,
];

export const updateCommentValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه نظر باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("متن نظر الزامی است")
    .isLength({ min: 1, max: 2000 })
    .withMessage("متن نظر باید بین ۱ تا ۲۰۰۰ کاراکتر باشد"),
  validate,
];

export const commentIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه نظر باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const getTaskCommentsValidator = [
  param("taskId")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شماره صفحه باید یک عدد صحیح بزرگتر از صفر باشد")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("تعداد در هر صفحه باید عددی بین ۱ تا ۱۰۰ باشد")
    .toInt(),
  validate,
];

export default {
  createCommentValidator,
  updateCommentValidator,
  commentIdValidator,
  getTaskCommentsValidator,
  validate,
};
