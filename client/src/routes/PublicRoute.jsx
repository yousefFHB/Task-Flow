import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../Store/hooks.js';
import { selectIsAuthenticated } from '../Store/Slice/authSlice.js';

export default function PublicRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
