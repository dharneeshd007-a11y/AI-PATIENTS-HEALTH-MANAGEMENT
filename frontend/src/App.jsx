import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import FloatingChatbot from './components/FloatingChatbot';
import MedicationReminder from './components/MedicationReminder';
import GlobalNotifications from './components/GlobalNotifications';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import DoctorPatients from './pages/DoctorPatients';
import LiveMonitoring from './pages/LiveMonitoring';
import ECGAnalysis from './pages/ECGAnalysis';
import MyHealth from './pages/MyHealth';
import PatientLiveMonitoring from './pages/PatientLiveMonitoring';
import PatientECG from './pages/PatientECG';
import PatientAlerts from './pages/PatientAlerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import Medications from './pages/Medications';
import EmergencySOS from './pages/EmergencySOS';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PDFReportGenerator from './pages/PDFReportGenerator';
import authService from './services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;
  
  const userObj = JSON.parse(userStr);
  if (allowedRoles && !allowedRoles.includes(userObj.user.role)) {
    // Redirect to login if they try to access a dashboard they don't have permission for
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout with Sidebar
const AppLayout = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const showChatbot = userObj?.user?.role === 'Patient' || userObj?.user?.role === 'Doctor';

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      {showChatbot && <FloatingChatbot />}
      <MedicationReminder />
      <GlobalNotifications />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin-doctors" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AppLayout><AdminDoctors /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin-patients" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AppLayout><AdminPatients /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/doctor-dashboard" element={
        <ProtectedRoute allowedRoles={['Doctor']}>
          <AppLayout><DoctorDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/doctor-patients" element={
        <ProtectedRoute allowedRoles={['Doctor']}>
          <AppLayout><DoctorPatients /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/live-monitoring" element={
        <ProtectedRoute allowedRoles={['Doctor', 'Admin', 'Patient']}>
          <AppLayout><LiveMonitoring /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/ecg-analysis" element={
        <ProtectedRoute allowedRoles={['Doctor', 'Admin', 'Patient']}>
          <AppLayout><ECGAnalysis /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/patient-dashboard" element={
        <ProtectedRoute allowedRoles={['Patient']}>
          <AppLayout><PatientDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-health" element={
        <ProtectedRoute allowedRoles={['Patient']}>
          <AppLayout><MyHealth /></AppLayout>
        </ProtectedRoute>
      } />



      <Route path="/patient-alerts" element={
        <ProtectedRoute allowedRoles={['Patient']}>
          <AppLayout><PatientAlerts /></AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient']}>
          <AppLayout><Reports /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient']}>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['Doctor', 'Patient']}>
          <AppLayout><Appointments /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/medications" element={
        <ProtectedRoute allowedRoles={['Doctor', 'Patient']}>
          <AppLayout><Medications /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/emergency-sos" element={
        <ProtectedRoute allowedRoles={['Patient']}>
          <AppLayout><EmergencySOS /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AppLayout><AnalyticsDashboard /></AppLayout>
        </ProtectedRoute>
      } />



      <Route path="/generate-pdf" element={
        <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient']}>
          <AppLayout><PDFReportGenerator /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Root Route - Always start at Login page as requested */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/alerts" element={
        <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
          <AppLayout><Alerts /></AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
