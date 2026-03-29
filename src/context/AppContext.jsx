// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authAPI, tokenStore } from '../services/api'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [modal,    setModal]    = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [toast,    setToast]    = useState(null)
  const [loading,  setLoading]  = useState(true)

  const showToast = useCallback((msg, duration = 3500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  // Restore session from stored JWT on page load
  useEffect(() => {
    const token = tokenStore.get()
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then((u) => {
        setUser(u)
        if (u.darkMode !== undefined) setDarkMode(u.darkMode)
      })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    // Save to backend if user is logged in
    if (user && user.id && tokenStore.get()) {
      authAPI.updateProfile({ darkMode })
        .catch(err => console.error('Failed to save theme preference:', err))
    }
  }, [darkMode, user])

  // Real login - called from AuthModal after successful API response
  const login = useCallback((userData, token) => {
    if (token) tokenStore.set(token)
    setUser(userData)
    setModal(null)
    showToast(`Welcome back, ${userData.fullName ?? userData.full_name}! 👋`)
  }, [showToast])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    showToast('You have been signed out.')
  }, [showToast])

  // Demo login - used when backend is not running
  const demoLogin = useCallback((role, name = 'Demo User', email = 'demo@stempath.io') => {
    setUser({ id: 'demo', fullName: name, full_name: name, email, role })
    setModal(null)
    showToast(`Welcome, ${name}! 👋`)
  }, [showToast])

  return (
    <AppCtx.Provider value={{
      user, login, logout, demoLogin, loading,
      modal, setModal,
      darkMode, setDarkMode,
      toast, showToast,
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
