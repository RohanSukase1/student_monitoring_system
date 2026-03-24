import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component Imports
import LoginPage from './components/login';
import PrincipalDashboard from './components/principal_dashboard';
import AnDepartmentDashboard from './components/an_department_dashboard';
import CoDepartmentDashboard from './components/co_department_dashboard';

// 🔒 Security Guard Component
const ProtectedRoute = ({ children, allowedRole, requiredDept }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || ''; 
  const deptName = localStorage.getItem('dept_name') || '';

  // 1. Not logged in? -> Go to Login
  if (!token) return <Navigate to="/" replace />;

  const isAdmin = role === 'admin' || role === 'principal';

  // 2. If page requires Admin but user is NOT Admin -> Send to their specific Dept
  if (allowedRole === 'admin' && !isAdmin) {
    if (deptName === 'AI & ML') return <Navigate to="/an-dept" replace />;
    if (deptName === 'Computer Engineering') return <Navigate to="/co-dept" replace />;
    return <Navigate to="/" replace />;
  }

  // 3. If page is for HOD (Departments) but Admin tries to access -> Go to Admin
  if (allowedRole === 'hod' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // 4. Strict Department Checking (Prevents CO from viewing AN, and vice versa)
  if (requiredDept && deptName !== requiredDept) {
    if (deptName === 'AI & ML') return <Navigate to="/an-dept" replace />;
    if (deptName === 'Computer Engineering') return <Navigate to="/co-dept" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* Admin / Principal Route */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <PrincipalDashboard />
          </ProtectedRoute>
        } />

        {/* AI & ML Department Route */}
        <Route path="/an-dept" element={
          <ProtectedRoute allowedRole="hod" requiredDept="AI & ML">
            <AnDepartmentDashboard />
          </ProtectedRoute>
        } />

        {/* Computer Engineering Department Route */}
        <Route path="/co-dept" element={
          <ProtectedRoute allowedRole="hod" requiredDept="Computer Engineering">
            <CoDepartmentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;