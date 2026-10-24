import { apiSlice } from '../../api/apiSlice.js';
import { setCredentials } from '../../Slice/authSlice.js';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.token && data?.data?.user) {
            dispatch(
              setCredentials({
                token: data.data.token,
                user: data.data.user,
              })
            );
          }
        } catch {
          // Handled by component error state
        }
      },
    }),

    register: builder.mutation({
      query: (registrationData) => ({
        url: '/auth/register',
        method: 'POST',
        body: registrationData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.token && data?.data?.user) {
            dispatch(
              setCredentials({
                token: data.data.token,
                user: data.data.user,
              })
            );
          }
        } catch {
          // Handled by component error state
        }
      },
    }),

    resendCode: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-code',
        method: 'POST',
        body: data,
      }),
    }),

    forgetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forget-pass',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResendCodeMutation,
  useForgetPasswordMutation,
} = authApi;

export default authApi;
