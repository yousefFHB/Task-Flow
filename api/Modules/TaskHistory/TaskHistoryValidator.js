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

export const taskIdParamValidator = [
  param("taskId")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
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
  validate,
];

export const getTaskHistoryValidator = taskIdParamValidator;

export default {
  taskIdParamValidator,
  getTaskHistoryValidator,
  validate,
  handleValidation,
};
