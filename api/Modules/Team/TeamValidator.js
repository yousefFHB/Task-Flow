import { body, param, validationResult } from "express-validator";

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

export const teamIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
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

export const createTeamValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام تیم الزامی است")
    .isLength({ min: 2, max: 100 })
    .withMessage("نام تیم باید بین ۲ تا ۱۰۰ کاراکتر باشد"),
  body("companyId")
    .notEmpty()
    .withMessage("شناسه شرکت الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه شرکت باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];

export const updateTeamValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام تیم نمی‌تواند خالی باشد")
    .isLength({ min: 2, max: 100 })
    .withMessage("نام تیم باید بین ۲ تا ۱۰۰ کاراکتر باشد"),
  validate,
];

export const addMemberValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("شماره موبایل کاربر الزامی است")
    .matches(/^09\d{9}$/)
    .withMessage("شماره موبایل نامعتبر است (مثال: 09123456789)"),
  validate,
];

export const removeMemberValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("شناسه تیم باید یک عدد صحیح معتبر باشد")
    .toInt(),
  body("memberId")
    .notEmpty()
    .withMessage("شناسه عضو الزامی است")
    .isInt({ min: 1 })
    .withMessage("شناسه عضو باید یک عدد صحیح معتبر باشد")
    .toInt(),
  validate,
];
