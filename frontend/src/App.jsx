import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'

import LoginPage           from './pages/LoginPage.jsx'
import RegisterPage        from './pages/RegisterPage.jsx'
import AdminDashboard      from './pages/admin/AdminDashboard.jsx'
import AdminDoctors        from './pages/admin/AdminDoctors.jsx'
import AdminPatients       from './pages/admin/AdminPatients.jsx'
import AdminBilling        from './pages/admin/AdminBilling.jsx'
import AdminUsers          from './pages/admin/AdminUsers.jsx'
import AdminPharmacy       from './pages/admin/AdminPharmacy.jsx'
import DoctorDashboard     from './pages/doctor/DoctorDashboard.jsx'
import DoctorAppointments  from './pages/doctor/DoctorAppointments.jsx'
import DoctorPatients      from './pages/doctor/DoctorPatients.jsx'
import PatientDashboard    from './pages/patient/PatientDashboard.jsx'
import PatientAppointments from './pages/patient/PatientAppointments.jsx'
import BookAppointment     from './pages/patient/BookAppointment.jsx'
import PatientBilling      from './pages/patient/PatientBilling.jsx'
import PatientProfile      from './pages/patient/PatientProfile.jsx'
import AppLayout           from './components/AppLayout.jsx'
import Spinner             from './components/Spinner.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullscreen />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullscreen />
  if (!user)   return <Navigate to="/login" replace />
  const map = { admin: '/admin', doctor: '/doctor', patient: '/patient' }
  return <Navigate to={map[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'Geist, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: '500',
              },
              success: { iconTheme: { primary: '#00d4aa', secondary: '#011a14' } },
              error:   { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
            }}
          />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/"         element={<RoleRedirect />} />

            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}><AppLayout role="admin" /></ProtectedRoute>
            }>
              <Route index           element={<AdminDashboard />} />
              <Route path="doctors"  element={<AdminDoctors />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="billing"  element={<AdminBilling />} />
              <Route path="billings" element={<Navigate to="/admin/billing" replace />} />
              <Route path="users"    element={<AdminUsers />} />
              <Route path="pharmacy" element={<AdminPharmacy />} />
            </Route>

            <Route path="/doctor" element={
              <ProtectedRoute roles={['doctor']}><AppLayout role="doctor" /></ProtectedRoute>
            }>
              <Route index               element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients"     element={<DoctorPatients />} />
            </Route>

            <Route path="/patient" element={
              <ProtectedRoute roles={['patient']}><AppLayout role="patient" /></ProtectedRoute>
            }>
              <Route index               element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="book"         element={<BookAppointment />} />
              <Route path="billing"      element={<PatientBilling />} />
              <Route path="profile"      element={<PatientProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
