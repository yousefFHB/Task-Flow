import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../Slice/authSlice.js';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const locale = localStorage.getItem('preferredLocale') || 'en';
    headers.set('x-locale', locale);
    headers.set('Accept-Language', locale);
    return headers;
  },
});

// Wrapper to intercept 401 Unauthorized responses and reset auth state
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Avoid resetting if trying to log in and credentials were bad
    const isLoginEndpoint = typeof args === 'object' && args.url?.includes('/auth/login');
    if (!isLoginEndpoint) {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'UserProfile',
    'Company',
    'Team',
    'Project',
    'Task',
    'TaskHistory',
    'TaskComment',
    'TimeEntry',
    'Notification',
    'EarningsSummary',
  ],
  endpoints: () => ({}),
});

export default apiSlice;
