import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { Layout } from './components/common/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { LeaveManagement } from './pages/admin/LeaveManagement';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { TrainingManagement } from './pages/admin/TrainingManagement';
import { AnnouncementManagement } from './pages/admin/AnnouncementManagement';
import { ReportsManagement } from './pages/admin/ReportsManagement';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { TeamMembers } from './pages/manager/TeamMembers';
import { TeamLeaves } from './pages/manager/TeamLeaves';
import { TeamAttendance } from './pages/manager/TeamAttendance';
import { TeamTraining } from './pages/manager/TeamTraining';
import { TeamAnnouncements } from './pages/manager/TeamAnnouncements';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeAttendance } from './pages/employee/EmployeeAttendance';
import { EmployeeLeaves } from './pages/employee/EmployeeLeaves';
import { EmployeeTraining } from './pages/employee/EmployeeTraining';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { EmployeeAnnouncements } from './pages/employee/EmployeeAnnouncements';

// Root redirector based on authenticated user's role
const RootRedirector = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Initializing StaffSync..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Role-Based Redirection */}
          <Route path="/" element={<RootRedirector />} />

          {/* Protected HR Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeManagement />} />
              <Route path="/admin/leaves" element={<LeaveManagement />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/departments" element={<DepartmentManagement />} />
              <Route path="/admin/trainings" element={<TrainingManagement />} />
              <Route path="/admin/announcements" element={<AnnouncementManagement />} />
              <Route path="/admin/reports" element={<ReportsManagement />} />
            </Route>
          </Route>

          {/* Protected Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route element={<Layout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/team" element={<TeamMembers />} />
              <Route path="/manager/leaves" element={<TeamLeaves />} />
              <Route path="/manager/attendance" element={<TeamAttendance />} />
              <Route path="/manager/training" element={<TeamTraining />} />
              <Route path="/manager/announcements" element={<TeamAnnouncements />} />
            </Route>
          </Route>

          {/* Protected Employee Routes (and accessible for all authenticated roles) */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']} />}>
            <Route element={<Layout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/attendance" element={<EmployeeAttendance />} />
              <Route path="/employee/leaves" element={<EmployeeLeaves />} />
              <Route path="/employee/training" element={<EmployeeTraining />} />
              <Route path="/employee/profile" element={<EmployeeProfile />} />
              <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
