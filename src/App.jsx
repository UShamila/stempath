import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar      from './components/Navbar'
import AuthModal   from './components/AuthModal'
import { Toast, VoiceWidget, BackgroundGrid } from './components/Widgets'
import LandingPage from './pages/LandingPage'
import StudentDashboard from './pages/StudentDashboard'
import MentorDashboard  from './pages/MentorDashboard'
import AdminDashboard   from './pages/AdminDashboard'

/* Protected route: redirect to home if not signed in with correct role */
function Protected({ role, children }) {
  const { user, setModal } = useApp()
  if (!user) { setModal('login'); return <Navigate to="/" replace /> }
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

/* App shell */
function Shell() {
  const { modal } = useApp()
  return (
    <>
      <BackgroundGrid />
      <div style={{ position:'relative', zIndex:1 }}>
        <Navbar />
        <Routes>
          <Route path="/"   element={<LandingPage />} />

          {/* Student routes */}
          <Route path="/student"          element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/mentors"  element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/courses"  element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/progress" element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/certs"    element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/forum"    element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/ai"       element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/settings" element={<Protected role="student"><StudentDashboard /></Protected>} />

          {/* Mentor routes */}
          <Route path="/mentor"           element={<Protected role="mentor"><MentorDashboard /></Protected>} />
          <Route path="/mentor/requests"  element={<Protected role="mentor"><MentorDashboard /></Protected>} />
          <Route path="/mentor/students"  element={<Protected role="mentor"><MentorDashboard /></Protected>} />
          <Route path="/mentor/progress"  element={<Protected role="mentor"><MentorDashboard /></Protected>} />
          <Route path="/mentor/chat"      element={<Protected role="mentor"><MentorDashboard /></Protected>} />
          <Route path="/mentor/settings"  element={<Protected role="mentor"><MentorDashboard /></Protected>} />

          {/* Admin routes */}
          <Route path="/admin"            element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/users"      element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/courses"    element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/approvals"  element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/analytics"  element={<Protected role="admin"><AdminDashboard /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {modal && <AuthModal />}
      <Toast />
      <VoiceWidget />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
