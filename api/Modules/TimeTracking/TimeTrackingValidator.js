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

export const createTimeEntryValidator = [
  body("projectId")
    .notEmpty()
    .withMessage("شناسه پروژه الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("taskId")
    .optional({ values: "null" })
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("duration")
    .notEmpty()
    .withMessage("مدت زمان الزامی است")
    .isInt({ min: 1, max: 10080 })
    .withMessage("مدت زمان باید یک عدد صحیح مثبت بر حسب دقیقه باشد (حداکثر ۱ هفته)")
    .toInt(),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("تاریخ باید یک فرمت تاریخ معتبر (ISO8601) باشد")
    .toDate(),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),
  validate,
];

export const updateTimeEntryValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه ثبت زمان باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("duration")
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage("مدت زمان باید یک عدد صحیح مثبت بر حسب دقیقه باشد")
    .toInt(),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("تاریخ باید یک فرمت تاریخ معتبر (ISO8601) باشد")
    .toDate(),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),
  validate,
];

export const timeEntryIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه ثبت زمان باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const listTimeEntriesValidator = [
  query("projectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  query("taskId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  query("userId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه کاربر باید یک عدد صحیح معتبر باشد")
    .toInt(),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ شروع نامعتبر است"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ پایان نامعتبر است"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شماره صفحه باید بزرگتر از صفر باشد")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("تعداد در هر صفحه باید بین ۱ تا ۱۰۰ باشد")
    .toInt(),
  validate,
];

export const taskSummaryValidator = [
  param("taskId")
    .isInt({ min: 1 })
    .withMessage("شناسه تسک باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const projectSummaryValidator = [
  param("projectId")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const projectRateValidator = [
  param("projectId")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("hourlyRateCents")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null) return true;
      if (!Number.isInteger(Number(val)) || Number(val) < 0) {
        throw new Error("نرخ ساعتی باید یک عدد صحیح غیر منفی باشد (سنت)");
      }
      return true;
    }),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("کد ارز باید ۳ حرفی باشد (مثلاً USD)")
    .toUpperCase(),
  validate,
];

export const earningsSummaryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ شروع نامعتبر است"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ پایان نامعتبر است"),
  query("projectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const projectEarningsValidator = [
  param("projectId")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ شروع نامعتبر است"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("تاریخ پایان نامعتبر است"),
  validate,
];

export const getMemberRatesValidator = [
  param("projectId")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const memberRateValidator = [
  param("projectId")
    .isInt({ min: 1 })
    .withMessage("شناسه پروژه باید یک عدد صحیح معتبر باشد")
    .toInt(),
  param("targetUserId")
    .isInt({ min: 1 })
    .withMessage("شناسه کاربر باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("hourlyRateCents")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === "") return true;
      if (!Number.isInteger(Number(val)) || Number(val) < 0) {
        throw new Error("نرخ ساعتی باید یک عدد صحیح غیر منفی باشد (سنت)");
      }
      return true;
    }),
  validate,
];

export default {
  createTimeEntryValidator,
  updateTimeEntryValidator,
  timeEntryIdValidator,
  listTimeEntriesValidator,
  taskSummaryValidator,
  projectSummaryValidator,
  projectRateValidator,
  getMemberRatesValidator,
  memberRateValidator,
  earningsSummaryValidator,
  projectEarningsValidator,
  validate,
};
