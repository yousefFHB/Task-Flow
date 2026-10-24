import { param, query, validationResult } from "express-validator";

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

export const handleValidation = validate;

export const notificationIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه اعلان باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const getMyNotificationsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شماره صفحه باید یک عدد صحیح و بزرگتر از صفر باشد")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("تعداد در هر صفحه باید عددی بین ۱ تا ۱۰۰ باشد")
    .toInt(),
  query("isRead")
    .optional()
    .isBoolean()
    .withMessage("وضعیت خوانده شدن باید مقدار بولی (true یا false) باشد")
    .toBoolean(),
  validate,
];

export const listNotificationsValidator = getMyNotificationsValidator;

export default {
  notificationIdValidator,
  getMyNotificationsValidator,
  listNotificationsValidator,
  validate,
  handleValidation,
};
