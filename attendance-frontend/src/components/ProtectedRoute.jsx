import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps any page that requires login.
 * role = "faculty" → checks faculty login
 * role = "student" → checks student login
 *
 * Usage in App.jsx:
 * <Route path="/faculty/dashboard"
 *   element={
 *     <ProtectedRoute role="faculty">
 *       <FacultyDashboard />
 *     </ProtectedRoute>
 *   }
 * />
 */
export default function ProtectedRoute({ children, role = 'faculty' }) {
  const { faculty, student } = useAuth()

  if (role === 'faculty' && !faculty) {
    return <Navigate to="/faculty/login" replace />
  }

  if (role === 'student' && !student) {
    return <Navigate to="/student/login" replace />
  }

  return children
}