import express from "express";
import { login, register, forgetPassword, resendCode } from "./AuthCn.js";
import {
  loginValidator,
  registerValidator,
  forgetPasswordValidator,
  resendCodeValidator,
} from "./AuthValidator.js";

const router = express.Router();

router.post("/login", loginValidator, login);
router.post("/register", registerValidator, register);
router.post("/forget-pass", forgetPasswordValidator, forgetPassword);
router.post("/resend-code", resendCodeValidator, resendCode);

export default router;
