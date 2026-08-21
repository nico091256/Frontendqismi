import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import AdminGuard from './components/AdminGuard';
import ManagerGuard from './components/ManagerGuard';

// Sahifalarni lazy-load qilish
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));
const ReportsPage   = lazy(() => import('./pages/ReportsPage'));
const TasksPage     = lazy(() => import('./pages/TasksPage'));
const ManagerPage   = lazy(() => import('./pages/ManagerPage'));
const ProfilePage   = lazy(() => import('./pages/ProfilePage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));

// Yuklanayotgan holat spinneri
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', color: '#94a3b8', fontSize: '1rem', gap: '0.5rem',
    }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
      Yuklanmoqda...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Navbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Ildiz sahifa — dashboard ga yo'naltiradi */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Kirish sahifasi */}
          <Route path="/login" element={<LoginPage />} />

          {/* Umumiy Dashboard (#2) */}
          <Route
            path="/dashboard"
            element={
              <AdminGuard>
                <DashboardPage />
              </AdminGuard>
            }
          />

          {/* Murojaatlar ro'yxati (Admin Panel) */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            }
          />

          {/* Hisobotlar */}
          <Route
            path="/reports"
            element={
              <AdminGuard>
                <ReportsPage />
              </AdminGuard>
            }
          />

          {/* IT Support topshiriqlari */}
          <Route
            path="/tasks"
            element={
              <AdminGuard>
                <TasksPage />
              </AdminGuard>
            }
          />

          {/* Inventarizatsiya & Jihozlar hisobi */}
          <Route
            path="/inventory"
            element={
              <AdminGuard>
                <InventoryPage />
              </AdminGuard>
            }
          />

          {/* Profil va parol o'zgartirish (#6) */}
          <Route
            path="/profile"
            element={
              <AdminGuard>
                <ProfilePage />
              </AdminGuard>
            }
          />

          {/* Manager sahifasi */}
          <Route
            path="/manager"
            element={
              <ManagerGuard>
                <ManagerPage />
              </ManagerGuard>
            }
          />

          {/* Noma'lum yo'l */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}