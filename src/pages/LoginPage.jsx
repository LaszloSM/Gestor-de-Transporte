import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth, supabase } from '../services/supabase'
import { useAuthStore } from '../stores'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setSession, setUserProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const { session, user } = await auth.signIn(formData.email, formData.password)
      if (!session || !user) throw new Error('No se pudo crear la sesión')

      setSession(session)
      setUser(user)

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.active === false) {
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setUserProfile(null)
          toast.error('Tu cuenta está desactivada. Contacta al administrador.')
          return
        }
        setUserProfile(profile)
      }
      toast.success('¡Bienvenido!')
      navigate('/dashboard')
    } catch (error) {
      const msg = error.message || ''
      if (msg.includes('Invalid login credentials')) {
        toast.error('Correo o contraseña incorrectos')
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Confirma tu email antes de iniciar sesión')
      } else {
        toast.error(msg || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    }}>
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Transporte Electoral</h1>
          <p className="text-indigo-300 mt-2 text-sm">Sistema de gestión de transporte de votantes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <div className="space-y-5">
            <div className="form-group">
              <label className="block text-sm font-semibold text-indigo-200 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-indigo-200 mb-1.5">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email) {
                      toast.error('Escribe tu correo para restablecer contraseña')
                      return
                    }
                    try {
                      await supabase.auth.resetPasswordForEmail(formData.email, {
                        redirectTo: `${window.location.origin}/login`,
                      })
                      toast.success('Revisa tu correo para restablecer la contraseña')
                    } catch (e) {
                      toast.error(e.message || 'Error')
                    }
                  }}
                  className="text-xs text-indigo-300 hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-lg disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Iniciando sesión...
              </span>
            ) : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-indigo-400/60 text-xs mt-6">
          © 2026 Transporte Electoral · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
