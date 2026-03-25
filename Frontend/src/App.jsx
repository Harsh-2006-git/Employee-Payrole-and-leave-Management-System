import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import LeaveRequests from './pages/admin/LeaveRequests';
import PayrollManagement from './pages/admin/PayrollManagement';
import TemplateEditor from './pages/admin/TemplateEditor';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyHistory from './pages/employee/MyHistory';
import LeaveHistory from './pages/employee/LeaveHistory';
import AdminQRGenerator from './pages/admin/AdminQRGenerator';
import EmployeeQRScanner from './pages/employee/EmployeeQRScanner';
import AttendanceCalendar from './pages/employee/AttendanceCalendar';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeavePolicy from './pages/employee/LeavePolicy';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth-success" element={<AuthSuccess />} />

      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={user?.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />} />

        {/* Admin Routes */}
        <Route path="employees" element={<ProtectedRoute role="ADMIN"><EmployeeList /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute role="ADMIN"><LeaveRequests /></ProtectedRoute>} />
        <Route path="payroll" element={<ProtectedRoute role="ADMIN"><PayrollManagement /></ProtectedRoute>} />
        <Route path="templates" element={<ProtectedRoute role="ADMIN"><TemplateEditor /></ProtectedRoute>} />
        <Route path="admin-qr" element={<ProtectedRoute role="ADMIN"><AdminQRGenerator /></ProtectedRoute>} />
        <Route path="attendance-mgmt" element={<ProtectedRoute role="ADMIN"><AttendanceManagement /></ProtectedRoute>} />
        <Route path="attendance/:employeeId" element={<ProtectedRoute role="ADMIN"><AttendanceCalendar /></ProtectedRoute>} />

        {/* Employee Routes */}
        <Route path="apply-leave" element={<ProtectedRoute role="EMPLOYEE"><ApplyLeave /></ProtectedRoute>} />
        <Route path="my-history" element={<ProtectedRoute role="EMPLOYEE"><MyHistory /></ProtectedRoute>} />
        <Route path="leave-history" element={<ProtectedRoute role="EMPLOYEE"><LeaveHistory /></ProtectedRoute>} />
        <Route path="scan-qr" element={<ProtectedRoute role="EMPLOYEE"><EmployeeQRScanner /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute role="EMPLOYEE"><AttendanceCalendar /></ProtectedRoute>} />
        <Route path="leave-policy" element={<LeavePolicy />} />
      </Route>
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'custom-toast',
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 20px',
              },
            }}
          />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
