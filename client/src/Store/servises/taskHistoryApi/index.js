import { apiSlice } from '../../api/apiSlice.js';

export const taskHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTaskHistory: builder.query({
      query: ({ taskId, page = 1, limit = 50 }) => ({
        url: `/task-history/task/${taskId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { taskId }) => [
        { type: 'TaskHistory', id: `TASK_${taskId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTaskHistoryQuery } = taskHistoryApi;

export default taskHistoryApi;
