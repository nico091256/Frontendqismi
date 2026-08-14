import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import EmployeePage from './pages/EmployeePage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage';

import AdminGuard from './components/AdminGuard';

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
        <Route path="/" element={<EmployeePage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
