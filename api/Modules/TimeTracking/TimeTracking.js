import express from "express";
import {
  createTimeEntry,
  getTimeEntries,
  getTimeEntryById,
  updateTimeEntry,
  deleteTimeEntry,
  getTaskTimeSummary,
  getProjectTimeSummary,
  getProjectRate,
  setProjectRate,
  getProjectMemberRates,
  setProjectMemberRate,
  deleteProjectMemberRate,
  getMyEarningsSummary,
  getProjectEarningsReport,
} from "./TimeTrackingCn.js";
import {
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
} from "./TimeTrackingValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const timeTrackingRouter = express.Router();

timeTrackingRouter.use(isLogin);

// ─── Earnings summary for the authenticated user (self-scoped, no userId leak)
timeTrackingRouter
  .route("/my/earnings")
  .get(earningsSummaryValidator, getMyEarningsSummary);

// ─── List time entries & create new entry
timeTrackingRouter
  .route("/")
  .get(listTimeEntriesValidator, getTimeEntries)
  .post(createTimeEntryValidator, createTimeEntry);

// ─── Task summary (total time logged vs estimated time)
timeTrackingRouter
  .route("/task/:taskId/summary")
  .get(taskSummaryValidator, getTaskTimeSummary);

// ─── Project summary (total time logged across project + user breakdown)
timeTrackingRouter
  .route("/project/:projectId/summary")
  .get(projectSummaryValidator, getProjectTimeSummary);

// ─── Project hourly rate (admin set, any member view)
timeTrackingRouter
  .route("/project/:projectId/rate")
  .get(projectRateValidator, getProjectRate)
  .patch(projectRateValidator, setProjectRate);

// ─── Project member custom hourly rates
timeTrackingRouter
  .route("/project/:projectId/member-rates")
  .get(getMemberRatesValidator, getProjectMemberRates);

timeTrackingRouter
  .route("/project/:projectId/member-rates/:targetUserId")
  .put(memberRateValidator, setProjectMemberRate)
  .patch(memberRateValidator, setProjectMemberRate)
  .delete(memberRateValidator, deleteProjectMemberRate);

// ─── Project earnings report (admin-only, date-filtered)
timeTrackingRouter
  .route("/project/:projectId/earnings")
  .get(projectEarningsValidator, getProjectEarningsReport);

// ─── Single time entry operations: get, update, delete
timeTrackingRouter
  .route("/:id")
  .get(timeEntryIdValidator, getTimeEntryById)
  .patch(updateTimeEntryValidator, updateTimeEntry)
  .put(updateTimeEntryValidator, updateTimeEntry)
  .delete(timeEntryIdValidator, deleteTimeEntry);

export default timeTrackingRouter;
