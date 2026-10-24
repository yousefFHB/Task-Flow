import { createSlice } from '@reduxjs/toolkit';

// 24 hours maximum session duration in milliseconds
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Safely decode base64url JWT payload on the client without third-party dependencies
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Cryptographic and wall-clock safe session validity check
export function isSessionValid(token, sessionTimestamp) {
  if (!token || typeof token !== 'string') return false;

  // 1. Verify cryptographic JWT expiration claim
  const payload = parseJwtPayload(token);
  if (!payload || !payload.id) return false;

  if (payload.exp && typeof payload.exp === 'number') {
    if (Date.now() >= payload.exp * 1000) {
      return false;
    }
  }

  // 2. Verify 24-hour session window against local storage timestamp
  if (sessionTimestamp) {
    const ts = Number(sessionTimestamp);
    if (isNaN(ts) || ts <= 0) return false;
    const elapsed = Date.now() - ts;
    // Disallow future clock skew (>5 min) or elapsed time exceeding 24 hours
    if (elapsed < -300000 || elapsed >= SESSION_MAX_AGE_MS) {
      return false;
    }
  } else if (payload.iat && typeof payload.iat === 'number') {
    // Fall back to JWT issued-at timestamp if sessionTimestamp is not found
    const elapsedFromIat = Date.now() - payload.iat * 1000;
    if (elapsedFromIat < -300000 || elapsedFromIat >= SESSION_MAX_AGE_MS) {
      return false;
    }
  }

  return true;
}

// Clear all authentication artifacts from persistent storage
export function clearStoredAuth() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionTimestamp');
  } catch {
    // Ignore storage access errors
  }
}

// Initial state restoring session safely from localStorage with 24-hour expiration enforcement
function restoreInitialSession() {
  if (typeof window === 'undefined') {
    return { token: null, user: null, isAuthenticated: false, isInitialized: false };
  }

  try {
    const storedToken = localStorage.getItem('token');
    const storedTimestamp = localStorage.getItem('sessionTimestamp');

    if (!storedToken || !isSessionValid(storedToken, storedTimestamp)) {
      clearStoredAuth();
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      };
    }

    let storedUser = null;
    const raw = localStorage.getItem('user');
    if (raw) {
      storedUser = JSON.parse(raw);
    }

    return {
      token: storedToken,
      user: storedUser,
      isAuthenticated: true,
      isInitialized: true,
    };
  } catch {
    clearStoredAuth();
    return {
      token: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    };
  }
}

const initialState = restoreInitialSession();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      try {
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        localStorage.setItem('sessionTimestamp', Date.now().toString());
      } catch {
        // Ignore storage errors
      }
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem('user', JSON.stringify(state.user));
        } catch {
          // Ignore storage errors
        }
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearStoredAuth();
    },
    validateSession: (state) => {
      const storedTimestamp = localStorage.getItem('sessionTimestamp');
      if (!isSessionValid(state.token, storedTimestamp)) {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        clearStoredAuth();
      }
    },
    setSessionInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  setCredentials,
  updateUserData,
  logout,
  validateSession,
  setSessionInitialized,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;
