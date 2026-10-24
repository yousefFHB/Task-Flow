import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const localizedErrors = errorList.map((err) => {
      const msg = req.t ? req.t(err.msg) : err.msg;
      return {
        field: err.path,
        message: msg,
        code: `VALIDATION_${String(err.path || "FIELD").toUpperCase()}_INVALID`,
      };
    });

    const primaryMessage = localizedErrors[0].message;

    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: primaryMessage,
      },
      message: localizedErrors.map((e) => e.message).join(" | "),
      errors: localizedErrors,
    });
  }

  next();
};

export const handleValidationError = handleValidationErrors;
export default handleValidationErrors;
