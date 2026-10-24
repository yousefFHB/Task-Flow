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

export const handleValidation = validate;

const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "REVIEW", "CANCEL"];
const validPriorities = ["HIGH", "MEDIUM", "LOW", "URGENT"];

export const taskIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const getMyTasksValidator = [
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
  query("status")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validStatuses)
    .withMessage(`وضعیت تسک نامعتبر است (${validStatuses.join(", ")})`),
  query("priority")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validPriorities)
    .withMessage(`اولویت تسک نامعتبر است (${validPriorities.join(", ")})`),
  query("search")
    .optional()
    .trim(),
  validate,
];

export const listTasksValidator = getMyTasksValidator;

export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("عنوان تسک الزامی است")
    .isLength({ min: 2, max: 150 })
    .withMessage("عنوان تسک باید بین ۲ تا ۱۵۰ کاراکتر باشد"),
  body("description")
    .optional()
    .trim(),
  body("projectId")
    .notEmpty()
    .withMessage("شناسه پروژه الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("assignedToId")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("شناسه کاربر اختصاص داده شده باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("status")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validStatuses)
    .withMessage(`وضعیت تسک نامعتبر است (${validStatuses.join(", ")})`),
  body("priority")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validPriorities)
    .withMessage(`اولویت تسک نامعتبر است (${validPriorities.join(", ")})`),
  validate,
];

export const updateTaskValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("عنوان تسک نمی‌تواند خالی باشد")
    .isLength({ min: 2, max: 150 })
    .withMessage("عنوان تسک باید بین ۲ تا ۱۵۰ کاراکتر باشد"),
  body("description")
    .optional()
    .trim(),
  body("projectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("assignedToId")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("شناسه کاربر اختصاص داده شده باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("status")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validStatuses)
    .withMessage(`وضعیت تسک نامعتبر است (${validStatuses.join(", ")})`),
  body("priority")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(validPriorities)
    .withMessage(`اولویت تسک نامعتبر است (${validPriorities.join(", ")})`),
  validate,
];

export const updateTaskStatusValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("status")
    .trim()
    .notEmpty()
    .withMessage("وضعیت تسک الزامی است")
    .toUpperCase()
    .isIn(validStatuses)
    .withMessage(`وضعیت تسک نامعتبر است (${validStatuses.join(", ")})`),
  validate,
];

export const updateStatusValidator = updateTaskStatusValidator;

export default {
  taskIdValidator,
  getMyTasksValidator,
  listTasksValidator,
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  updateStatusValidator,
  validate,
  handleValidation,
};
