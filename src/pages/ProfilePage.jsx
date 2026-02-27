import React from 'react'
import { useAuthStore } from '../stores'
import { ROLE_LABELS, isSuperAdminEmail } from '../config'

export default function ProfilePage() {
  const { userProfile, user } = useAuthStore()
  const currentEmail = userProfile?.email || user?.email
  const effectiveRole = isSuperAdminEmail(currentEmail) ? 'superadmin' : userProfile?.role

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi Perfil</h1>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="text-white text-xl font-bold">
              {(userProfile?.full_name || currentEmail || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {userProfile?.full_name || 'Sin nombre'}
            </h2>
            <span className={`badge mt-1 ${effectiveRole === 'superadmin' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
              {ROLE_LABELS[effectiveRole] || effectiveRole}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Correo Electrónico</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{currentEmail || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Teléfono</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{userProfile?.phone || 'No registrado'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Estado</p>
            <span className={`badge mt-0.5 ${userProfile?.active !== false ? 'badge-completed' : 'badge-cancelled'}`}>
              {userProfile?.active !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Miembro desde</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('es-CO', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
