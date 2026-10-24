import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../Store/hooks.js';
import { selectIsAuthenticated } from '../Store/Slice/authSlice.js';

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
