import { apiSlice } from '../../api/apiSlice.js';

export const taskCommentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: ({ taskId, page = 1, limit = 50 }) => ({
        url: `/comments/task/${taskId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { taskId }) => [
        { type: 'TaskComment', id: `TASK_${taskId}` },
      ],
    }),

    createComment: builder.mutation({
      query: ({ taskId, content }) => ({
        url: `/comments/task/${taskId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'TaskComment', id: `TASK_${taskId}` },
        { type: 'TaskHistory', id: `TASK_${taskId}` },
      ],
    }),

    updateComment: builder.mutation({
      query: ({ id, content }) => ({
        url: `/comments/${id}`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'TaskComment', id: `TASK_${taskId}` },
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'TaskComment', id: `TASK_${taskId}` },
        { type: 'TaskHistory', id: `TASK_${taskId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = taskCommentApi;

export default taskCommentApi;
