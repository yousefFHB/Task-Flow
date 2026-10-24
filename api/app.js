import express from "express";
import morgan from "morgan";
import redis from "./config/redis.js";
import authRouter from "./Modules/Auth/Auth.js";
import userRouter from "./Modules/Users/Users.js";
import companyRouter from "./Modules/Company/Company.js";
import teamRouter from "./Modules/Team/Team.js";
import projectRouter from "./Modules/Projects/Projects.js";
import taskRouter from "./Modules/Task/Task.js";
import taskHistoryRouter from "./Modules/TaskHistory/TaskHistory.js";
import taskCommentRouter from "./Modules/TaskComment/TaskComment.js";
import timeTrackingRouter from "./Modules/TimeTracking/TimeTracking.js";
import notificationRouter from "./Modules/Notification/Notification.js";
import docsRouter from "./Utils/docsRouter.js";
import { i18nMiddleware } from "./config/i18n.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Enable CORS for frontend requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-locale, Accept-Language");
    res.header("Access-Control-Expose-Headers", "Content-Language");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Request-scoped internationalization middleware (en & fa)
app.use(i18nMiddleware);

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/companies", companyRouter);
app.use("/api/team", teamRouter);
app.use("/api/teams", teamRouter);
app.use("/api/project", projectRouter);
app.use("/api/projects", projectRouter);
app.use("/api/task", taskRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/task-history", taskHistoryRouter);
app.use("/api/tasks/:taskId/history", taskHistoryRouter);
app.use("/api/comments", taskCommentRouter);
app.use("/api/task-comments", taskCommentRouter);
app.use("/api/tasks/:taskId/comments", taskCommentRouter);
app.use("/api/time-entries", timeTrackingRouter);
app.use("/api/time-tracking", timeTrackingRouter);
app.use("/api/tasks/:taskId/time-entries", timeTrackingRouter);
app.use("/api/projects/:projectId/time-entries", timeTrackingRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/notifications", notificationRouter);

// API Documentation & Interactive Swagger UI with search
app.use("/docs", docsRouter);
app.use("/api-docs", docsRouter);

app.get("/health", (req, res) => {
    res.sendLocalized({
        status: 200,
        success: true,
        messageKey: "system.healthy",
        data: {
            redis: redis.isOpen ? "ready" : "disconnected",
        },
    });
});

// Centralized Localized Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    const isServerErr = statusCode >= 500;

    // Never leak stack traces or internal DB exceptions to clients
    let localizedMessage;
    if (isServerErr) {
        localizedMessage = req.t ? req.t("system.internalServerError") : "An internal server error occurred. Please try again later.";
    } else {
        const rawMessage = err.message || "An unexpected error occurred";
        localizedMessage = req.t ? req.t(rawMessage) : rawMessage;
    }

    const defaultCode = statusCode === 404
        ? "NOT_FOUND"
        : statusCode === 401
        ? "AUTH_UNAUTHORIZED"
        : statusCode === 403
        ? "FORBIDDEN"
        : isServerErr
        ? "INTERNAL_SERVER_ERROR"
        : "BAD_REQUEST";

    const code = err.code || defaultCode;

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: localizedMessage,
        },
        message: localizedMessage,
    });
});

export default app;

