import jwt from "jsonwebtoken";
import prisma from "../src/config/prisma.js";

export const socketAuth = async (socket, next) => {
  try {
    let token =
      socket.handshake?.auth?.token ||
      socket.handshake?.headers?.authorization?.split(" ")?.at(1) ||
      socket.handshake?.query?.token;

    if (!token) {
      return next(new Error("Authentication token is missing"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new Error("JWT secret not configured"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }

    if (!decoded || !decoded.id) {
      return next(new Error("Invalid token payload"));
    }

    const userId = Number(decoded.id);
    if (isNaN(userId)) {
      return next(new Error("Invalid user ID in token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        preferredLocale: true,
      },
    });

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error("Authentication failed"));
  }
};

export default socketAuth;
