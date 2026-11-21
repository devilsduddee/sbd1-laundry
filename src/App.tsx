import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { ServicesPage } from './pages/ServicesPage';
import { StaffPage } from './pages/StaffPage';
import { ReportPage } from './pages/ReportPage';
import { Loader2 } from 'lucide-react';
import type { LevelPtgs } from '@shared/schemas';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: LevelPtgs[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] text-xs text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin text-indigo-600" />
        Memeriksa sesi login...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.level)) {
    return <Navigate to="/" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rute Terproteksi AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesanan/baru"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesanan/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pelanggan"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Kasir']}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/layanan"
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/petugas"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ReportPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
