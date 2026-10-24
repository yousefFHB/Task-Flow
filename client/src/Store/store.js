import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slice/authSlice.js';
import themeReducer from './Slice/themeSlice.js';
import { apiSlice } from './api/apiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
