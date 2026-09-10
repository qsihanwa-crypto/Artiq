import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export function RequireAuth({ children }) {
  const { authed } = useAdminAuth()
  return authed ? children : <Navigate to="/admin/login" replace />
}
