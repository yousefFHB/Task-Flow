import { apiSlice } from '../../api/apiSlice.js';
import { updateUserData, logout } from '../../Slice/authSlice.js';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query({
      query: ({ q, page = 1, limit = 10 }) => ({
        url: '/users',
        params: { q, page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: () => [
        { type: 'UserProfile' },
        { type: 'User', id: 'LIST' },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(updateUserData(data.data));
          }
        } catch {
          // Handled by UI error state
        }
      },
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: '/users',
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          // Handled by UI error state
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchUsersQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} = userApi;

export default userApi;
