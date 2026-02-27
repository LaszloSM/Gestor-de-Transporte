import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth, supabase } from '../services/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await auth.signUp(formData.email, formData.password)
      
      if (error) {
        throw error
      }

      // Actualizar perfil (el trigger handle_new_user en fix-auth.sql debe crear la fila en users)
      if (data?.user?.id) {
        await supabase
          .from('users')
          .update({
            full_name: formData.fullName || formData.email.split('@')[0],
            role: 'operator',
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id)
      }

      toast.success('¡Cuenta creada exitosamente! Inicia sesión.')
      navigate('/login')
    } catch (error) {
      const msg = error.message || ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('ya está registrado') || msg.toLowerCase().includes('already been registered')) {
        toast.success('Ese correo ya tiene cuenta. Redirigiendo a inicio de sesión…')
        navigate('/login', { state: { email: formData.email } })
      } else {
        toast.error(msg || 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-primary-900/20 to-slate-900">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Registrarse</h1>
          <p className="text-slate-400 mt-2">Crea una nueva cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-primary-600 font-semibold hover:underline">
              Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
