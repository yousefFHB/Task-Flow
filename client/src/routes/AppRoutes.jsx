import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

import { useAppSelector } from '../Store/hooks.js';
import { selectIsAuthenticated } from '../Store/Slice/authSlice.js';

import LandingPage from '../pages/landing/LandingPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';

import OverviewPage from '../pages/dashboard/OverviewPage.jsx';
import UserProfilePage from '../pages/users/UserProfilePage.jsx';
import UserDirectoryPage from '../pages/users/UserDirectoryPage.jsx';
import CompanyPage from '../pages/company/CompanyPage.jsx';
import TasksPage from '../pages/tasks/TasksPage.jsx';
import ProjectsPage from '../pages/projects/ProjectsPage.jsx';
import TeamsPage from '../pages/teams/TeamsPage.jsx';
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx';
import PendingFeaturePage from '../pages/pending/PendingFeaturePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export default function AppRoutes() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Landing page accessible directly */}
      <Route path="/landing" element={<LandingPage />} />

      {/* Root route: Showcase landing page for guests, Overview Dashboard for authenticated members */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <OverviewPage />
            </DashboardLayout>
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Public routes wrapped in AuthLayout */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* Protected routes wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/users" element={<UserDirectoryPage />} />
          <Route path="/company" element={<CompanyPage />} />

          {/* Implemented domain routes */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Future domain routes */}
          <Route path="/sprints" element={<PendingFeaturePage />} />
        </Route>
      </Route>

      {/* 404 handler */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

