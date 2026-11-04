import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/data/auth/auth-context';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { MembersPage } from '@/pages/members';
import { MemberDetailPage } from '@/pages/members/detail';
import { EventsPage } from '@/pages/events';
import { AppLayout } from '@/components/layout/AppLayout';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#1e1e1e]">
        <p className="text-sm font-medium text-[#1e1e1e]/60">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rute Terlindungi dengan AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Rute Member & Divisi (Tahap 4) */}
            <Route
              path="/members"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <MemberDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'po']}>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cash"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'executive']}>
                  <div className="p-4">Halaman Kas (Tahap 7)</div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirect bawaan */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

