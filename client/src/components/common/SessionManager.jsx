import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Store/hooks.js';
import {
  selectIsAuthenticated,
  selectCurrentToken,
  isSessionValid,
  logout,
} from '../../Store/Slice/authSlice.js';

export default function SessionManager() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectCurrentToken);

  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    if (!isSessionValid(token, sessionTimestamp)) {
      dispatch(logout());
      if (location.pathname !== '/login') {
        navigate('/login', {
          replace: true,
          state: { sessionExpired: true, from: location },
        });
      }
    }
  }, [isAuthenticated, token, dispatch, navigate, location]);

  useEffect(() => {
    // Initial check on mount
    checkSession();

    // Check when user returns to the tab or focuses window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => {
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkSession]);

  return null;
}
