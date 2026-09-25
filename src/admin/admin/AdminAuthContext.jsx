import { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem('admin_token')))

  return (
    <AdminAuthContext.Provider value={{ authed, setAuthed }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
