import jwt from "jsonwebtoken";
import { HandleERROR } from "vanta-api";
import prisma from "../src/config/prisma.js";
import redis from "../config/redis.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      token = authHeader;
    } else if (req.headers.token) {
      token = req.headers.token;
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const msg = req.t ? req.t("auth.unauthorized") : "Authentication token is missing. Please log in.";
      return next(new HandleERROR(msg, 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured in environment variables.");
      const msg = req.t ? req.t("auth.configMissing") : "Internal Server Error: Authentication configuration missing.";
      return next(new HandleERROR(msg, 500));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        const msg = req.t ? req.t("auth.tokenExpired") : "Token has expired. Please log in again.";
        const err = new HandleERROR(msg, 401);
        err.code = "AUTH_TOKEN_EXPIRED";
        return next(err);
      }
      const msg = req.t ? req.t("auth.invalidToken") : "Invalid token. Please log in again.";
      const err = new HandleERROR(msg, 401);
      err.code = "AUTH_INVALID_TOKEN";
      return next(err);
    }

    if (!decoded || !decoded.id) {
      const msg = req.t ? req.t("auth.invalidToken") : "Invalid token payload.";
      return next(new HandleERROR(msg, 401));
    }

    const userId = Number(decoded.id);
    if (isNaN(userId)) {
      const msg = req.t ? req.t("auth.invalidToken") : "Invalid user identifier in token.";
      return next(new HandleERROR(msg, 401));
    }

    // Check Redis cache first
    let user = null;
    try {
      if (redis.isOpen) {
        const cachedUser = await redis.get(`user:${userId}`);
        if (cachedUser) {
          user = JSON.parse(cachedUser);
        }
      }
    } catch (cacheErr) {
      console.error("Redis read error in isLogin:", cacheErr.message || cacheErr);
    }

    // Fallback to database query if not in Redis
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          preferredLocale: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        const msg = req.t ? req.t("auth.userNoLongerExists") : "The user belonging to this token no longer exists.";
        return next(new HandleERROR(msg, 401));
      }

      // Cache user in Redis for 24 hours
      try {
        if (redis.isOpen) {
          await redis.set(`user:${userId}`, JSON.stringify(user), {
            EX: 60 * 60 * 24,
          });
        }
      } catch (cacheErr) {
        console.error("Redis write error in isLogin:", cacheErr.message || cacheErr);
      }
    }

    // Attach user information to request
    req.userId = user.id;
    req.user = user;

    // If request did not specify an explicit locale header/query, adopt user's preferred locale
    if (!req.headers["x-locale"] && !req.query?.locale && user.preferredLocale) {
      req.locale = user.preferredLocale;
      res.setHeader("Content-Language", user.preferredLocale);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const isLogin = (req, res, next) => {
  // Support both direct middleware `isLogin` and factory invocation `isLogin()`
  if (typeof req === "undefined" || (typeof req !== "object" && typeof res !== "object")) {
    return (innerReq, innerRes, innerNext) => authMiddleware(innerReq, innerRes, innerNext);
  }
  return authMiddleware(req, res, next);
};

export default isLogin;