import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import ManagerPage from './pages/ManagerPage';

import AdminGuard from './components/AdminGuard';
import ManagerGuard from './components/ManagerGuard';

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

      <Routes>
        {/* Ildiz sahifa — login ga yo'naltiradi */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Kirish sahifasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* IT Support sahifalari */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <AdminGuard>
              <ReportsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/tasks"
          element={
            <AdminGuard>
              <TasksPage />
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
