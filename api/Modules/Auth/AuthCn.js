import { catchAsync, HandleERROR } from "vanta-api";
import prisma from "../../src/config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendAuthCode, verifyCode } from "../../Utils/smsHandler.js";

export const login = catchAsync(async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    const msg = req.t ? req.t("auth.invalidCredentials") : "Invalid phone number or password";
    const err = new HandleERROR(msg, 401);
    err.code = "AUTH_INVALID_CREDENTIALS";
    return next(err);
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    const msg = req.t ? req.t("auth.invalidCredentials") : "Invalid phone number or password";
    const err = new HandleERROR(msg, 401);
    err.code = "AUTH_INVALID_CREDENTIALS";
    return next(err);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "AUTH_LOGIN_SUCCESS",
    messageKey: "auth.loginSuccess",
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        preferredLocale: user.preferredLocale || "en",
      },
    },
  });
});

export const register = catchAsync(async (req, res, next) => {
  const { code, phoneNumber, name, password, preferredLocale = "en" } = req.body;
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (user) {
    const msg = req.t ? req.t("auth.userAlreadyExists") : "A user with this phone number already exists";
    const err = new HandleERROR(msg, 400);
    err.code = "AUTH_USER_EXISTS";
    return next(err);
  }

  const verification = await verifyCode(phoneNumber, code);
  if (!verification.success) {
    const msg = req.t ? req.t("auth.invalidVerificationCode") : verification.message;
    const err = new HandleERROR(msg, 400);
    err.code = "AUTH_INVALID_CODE";
    return next(err);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await prisma.user.create({
    data: {
      phoneNumber,
      password: hashedPassword,
      name,
      preferredLocale: ["en", "fa"].includes(preferredLocale) ? preferredLocale : "en",
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      preferredLocale: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

  return res.sendLocalized({
    status: 201,
    success: true,
    code: "AUTH_REGISTER_SUCCESS",
    messageKey: "auth.registerSuccess",
    data: { token, user: newUser },
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { phoneNumber, code, newPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    const msg = req.t ? req.t("auth.userNotFound") : "User not found";
    const err = new HandleERROR(msg, 404);
    err.code = "AUTH_USER_NOT_FOUND";
    return next(err);
  }

  const verification = await verifyCode(phoneNumber, code);
  if (!verification.success) {
    const msg = req.t ? req.t("auth.invalidVerificationCode") : verification.message;
    const err = new HandleERROR(msg, 400);
    err.code = "AUTH_INVALID_CODE";
    return next(err);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { phoneNumber },
    data: { password: hashedPassword },
  });

  return res.sendLocalized({
    status: 200,
    success: true,
    code: "AUTH_PASSWORD_RESET_SUCCESS",
    messageKey: "auth.passwordResetSuccess",
  });
});

export const resendCode = catchAsync(async (req, res, next) => {
  const { phoneNumber } = req.body;
  await sendAuthCode(phoneNumber);
  return res.sendLocalized({
    status: 200,
    success: true,
    code: "AUTH_CODE_SENT",
    messageKey: "auth.verificationCodeSent",
  });
});
