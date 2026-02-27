import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores'
import { isSuperAdminEmail } from './config'
import { Toaster } from 'react-hot-toast'
import { supabase } from './services/supabase'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RequestsListPage from './pages/RequestsListPage'
import NewRequestPage from './pages/NewRequestPage'
import AuditPage from './pages/AuditPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/UsersPage'

// Components
import Layout from './components/Layout'

// Protected route: requires authenticated user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

// Admin+Superadmin route
const AdminRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || isSuperAdminEmail(userProfile?.email || user?.email)
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="spinner mx-auto mb-3" style={{ borderTopColor: '#818cf8', borderColor: 'rgba(255,255,255,0.1)' }} />
        <p className="text-indigo-300 text-sm">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { setUser, setSession, setLoading, setUserProfile } = useAuthStore()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) { setLoading(false); return }

        if (session?.user) {
          setUser(session.user)
          setSession(session)

          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              if (profile.active === false) {
                await supabase.auth.signOut()
                setUser(null)
                setUserProfile(null)
              } else {
                setUserProfile(profile)
              }
            }
          } catch (_) { }
        }
      } catch (_) { } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(checkSession, 100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              if (profile.active === false) {
                supabase.auth.signOut()
                setUser(null)
                setUserProfile(null)
              } else {
                setUserProfile(profile)
              }
            }
          })
          .catch(() => { })
      } else {
        setUser(null)
        setSession(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => {
      clearTimeout(timer)
      subscription?.unsubscribe()
    }
  }, [setUser, setSession, setLoading, setUserProfile])

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/requests" element={<RequestsListPage />} />
                  <Route path="/new-request" element={<NewRequestPage />} />
                  <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                  <Route path="/audit" element={<AdminRoute><AuditPage /></AdminRoute>} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
          },
        }}
      />
    </Router>
  )
}
