import { createSlice } from '@reduxjs/toolkit';

// Resolve initial theme mode: check localStorage first, then system preference, default to 'light'
const getInitialThemeMode = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // In case of restricted localStorage access
  }
  return 'light';
};

const initialState = {
  mode: getInitialThemeMode(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      const mode = action.payload === 'dark' ? 'dark' : 'light';
      state.mode = mode;
      try {
        localStorage.setItem('themeMode', mode);
      } catch {
        // Ignore storage errors
      }
    },
    toggleThemeMode: (state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextMode;
      try {
        localStorage.setItem('themeMode', nextMode);
      } catch {
        // Ignore storage errors
      }
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;

export const selectThemeMode = (state) => state.theme.mode;

export default themeSlice.reducer;
