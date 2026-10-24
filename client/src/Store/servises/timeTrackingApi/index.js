import { apiSlice } from '../../api/apiSlice.js';

export const timeTrackingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTimeEntries: builder.query({
      query: (params) => ({
        url: '/time-entries',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({ type: 'TimeEntry', id: item.id })),
              { type: 'TimeEntry', id: 'LIST' },
            ]
          : [{ type: 'TimeEntry', id: 'LIST' }],
    }),

    getTimeEntryById: builder.query({
      query: (id) => `/time-entries/${id}`,
      providesTags: (result, error, id) => [{ type: 'TimeEntry', id }],
    }),

    getTaskTimeSummary: builder.query({
      query: (taskId) => `/time-entries/task/${taskId}/summary`,
      providesTags: (result, error, taskId) => [
        { type: 'TimeEntry', id: `TASK_SUMMARY_${taskId}` },
      ],
    }),

    getProjectTimeSummary: builder.query({
      query: (projectId) => `/time-entries/project/${projectId}/summary`,
      providesTags: (result, error, projectId) => [
        { type: 'TimeEntry', id: `PROJECT_SUMMARY_${projectId}` },
      ],
    }),

    // ─── Hourly Rate ─────────────────────────────────────────────────────────

    getProjectRate: builder.query({
      query: (projectId) => `/time-entries/project/${projectId}/rate`,
      providesTags: (result, error, projectId) => [
        { type: 'Project', id: `RATE_${projectId}` },
      ],
    }),

    setProjectRate: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/time-entries/project/${projectId}/rate`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: `RATE_${projectId}` },
        { type: 'Project', id: `MEMBER_RATES_${projectId}` },
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
        { type: 'TimeEntry', id: `PROJECT_SUMMARY_${projectId}` },
        { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
      ],
    }),

    // ─── Member Custom Rates ──────────────────────────────────────────────────

    getProjectMemberRates: builder.query({
      query: (projectId) => `/time-entries/project/${projectId}/member-rates`,
      providesTags: (result, error, projectId) => [
        { type: 'Project', id: `MEMBER_RATES_${projectId}` },
      ],
    }),

    setProjectMemberRate: builder.mutation({
      query: ({ projectId, targetUserId, hourlyRateCents }) => ({
        url: `/time-entries/project/${projectId}/member-rates/${targetUserId}`,
        method: 'PUT',
        body: { hourlyRateCents },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: `MEMBER_RATES_${projectId}` },
        { type: 'Project', id: `RATE_${projectId}` },
        { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
      ],
    }),

    deleteProjectMemberRate: builder.mutation({
      query: ({ projectId, targetUserId }) => ({
        url: `/time-entries/project/${projectId}/member-rates/${targetUserId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: `MEMBER_RATES_${projectId}` },
        { type: 'Project', id: `RATE_${projectId}` },
        { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
      ],
    }),

    // ─── Earnings Summaries ───────────────────────────────────────────────────

    /** Self-scoped earnings summary — always the signed-in user */
    getMyEarningsSummary: builder.query({
      query: (params) => ({
        url: '/time-entries/my/earnings',
        params,
      }),
      providesTags: ['EarningsSummary'],
    }),

    /** Admin-only project earnings report with per-member breakdown */
    getProjectEarningsReport: builder.query({
      query: ({ projectId, ...params }) => ({
        url: `/time-entries/project/${projectId}/earnings`,
        params,
      }),
      providesTags: (result, error, { projectId }) => [
        { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
      ],
    }),

    // ─── CRUD ────────────────────────────────────────────────────────────────

    createTimeEntry: builder.mutation({
      query: (data) => ({
        url: '/time-entries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { taskId, projectId }) => [
        { type: 'TimeEntry', id: 'LIST' },
        'EarningsSummary',
        ...(taskId
          ? [
              { type: 'TimeEntry', id: `TASK_SUMMARY_${taskId}` },
              { type: 'TaskHistory', id: `TASK_${taskId}` },
            ]
          : []),
        ...(projectId
          ? [
              { type: 'TimeEntry', id: `PROJECT_SUMMARY_${projectId}` },
              { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
            ]
          : []),
      ],
    }),

    updateTimeEntry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/time-entries/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id, taskId, projectId }) => [
        { type: 'TimeEntry', id },
        { type: 'TimeEntry', id: 'LIST' },
        'EarningsSummary',
        ...(taskId ? [{ type: 'TimeEntry', id: `TASK_SUMMARY_${taskId}` }] : []),
        ...(projectId
          ? [
              { type: 'TimeEntry', id: `PROJECT_SUMMARY_${projectId}` },
              { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
            ]
          : []),
      ],
    }),

    deleteTimeEntry: builder.mutation({
      query: ({ id }) => ({
        url: `/time-entries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, taskId, projectId }) => [
        { type: 'TimeEntry', id },
        { type: 'TimeEntry', id: 'LIST' },
        'EarningsSummary',
        ...(taskId ? [{ type: 'TimeEntry', id: `TASK_SUMMARY_${taskId}` }] : []),
        ...(projectId
          ? [
              { type: 'TimeEntry', id: `PROJECT_SUMMARY_${projectId}` },
              { type: 'TimeEntry', id: `EARNINGS_${projectId}` },
            ]
          : []),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTimeEntriesQuery,
  useGetTimeEntryByIdQuery,
  useGetTaskTimeSummaryQuery,
  useGetProjectTimeSummaryQuery,
  useGetProjectRateQuery,
  useSetProjectRateMutation,
  useGetProjectMemberRatesQuery,
  useSetProjectMemberRateMutation,
  useDeleteProjectMemberRateMutation,
  useGetMyEarningsSummaryQuery,
  useGetProjectEarningsReportQuery,
  useCreateTimeEntryMutation,
  useUpdateTimeEntryMutation,
  useDeleteTimeEntryMutation,
} = timeTrackingApi;

export default timeTrackingApi;
