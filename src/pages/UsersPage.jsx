import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { db } from '../services/supabase'
import { ROLES, ROLE_LABELS, isSuperAdminEmail } from '../config'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.COORDINATOR, label: ROLE_LABELS[ROLES.COORDINATOR] },
  { value: ROLES.OPERATOR, label: ROLE_LABELS[ROLES.OPERATOR] },
]

export default function UsersPage() {
  const { userProfile, user, hasPermission, isSuperAdmin: checkIsSuperAdmin } = useAuthStore()
  const canManage = hasPermission('manage_users')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formEdit, setFormEdit] = useState({ full_name: '', role: '', active: true })
  const [formCreate, setFormCreate] = useState({ email: '', password: '', full_name: '', role: ROLES.OPERATOR })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (canManage) loadUsers()
  }, [canManage])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await db.getUsers()
      setUsers(data || [])
    } catch (_) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (u) => {
    setEditingUser(u)
    setFormEdit({ full_name: u.full_name || '', role: u.role || ROLES.OPERATOR, active: u.active !== false })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setUpdatingId(editingUser.id)
    try {
      const payload = { full_name: formEdit.full_name.trim() || null, active: formEdit.active }
      if (!isSuperAdminEmail(editingUser.email)) {
        payload.role = formEdit.role
      }
      await db.updateUserProfile(editingUser.id, payload)

      // Audit log for role change
      if (payload.role && payload.role !== editingUser.role) {
        try {
          await db.logAudit({
            action: 'ROLE_CHANGE',
            resource_type: 'user',
            resource_id: editingUser.id,
            old_values: { role: editingUser.role },
            new_values: { role: payload.role },
          })
        } catch (_) { }
      }

      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...payload, role: payload.role ?? u.role } : u))
      toast.success('Usuario actualizado')
      setEditingUser(null)
    } catch (error) {
      toast.error(error.message || 'Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleActive = async (u) => {
    if (isSuperAdminEmail(u.email)) return
    setUpdatingId(u.id)
    try {
      const newActive = !(u.active !== false)
      await db.updateUserProfile(u.id, { active: newActive })
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, active: newActive } : x))
      toast.success(newActive ? 'Usuario reactivado' : 'Usuario desactivado')
    } catch (error) {
      toast.error(error.message || 'Error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCreateUser = async (e) => {
    e?.preventDefault()
    const { email, password, full_name, role } = formCreate
    if (!email?.trim()) { toast.error('El correo es obligatorio'); return }
    if (!password || password.length < 6) { toast.error('Contraseña mínima: 6 caracteres'); return }

    setCreating(true)
    try {
      await db.createUser(email.trim(), password, full_name?.trim() || '', role || ROLES.OPERATOR)
      await loadUsers()
      setShowCreateModal(false)
      setFormCreate({ email: '', password: '', full_name: '', role: ROLES.OPERATOR })
      toast.success('Usuario creado exitosamente')
    } catch (error) {
      toast.error(error.message || 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  if (!canManage) return <Navigate to="/dashboard" replace />

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">Administra roles y accesos del sistema.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Crear Usuario
        </button>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="table-header">Nombre</th>
                <th className="table-header">Email</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Estado</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuperU = isSuperAdminEmail(u.email)
                return (
                  <tr key={u.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors ${u.active === false ? 'opacity-50' : ''}`}>
                    <td className="table-cell font-medium">{u.full_name || '—'}</td>
                    <td className="table-cell text-slate-500 text-sm">{u.email}</td>
                    <td className="table-cell">
                      {isSuperU ? (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-200/60">
                          🔒 Superusuario
                        </span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {u.active === false ? (
                        <span className="badge badge-cancelled">Inactivo</span>
                      ) : (
                        <span className="badge badge-completed">Activo</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="btn-ghost text-xs text-indigo-600">
                          Editar
                        </button>
                        {!isSuperU && (
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={updatingId === u.id}
                            className={`btn-ghost text-xs ${u.active !== false ? 'text-red-600' : 'text-emerald-600'}`}
                          >
                            {u.active !== false ? 'Desactivar' : 'Reactivar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No hay usuarios.</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Crear Usuario</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input type="email" value={formCreate.email} onChange={(e) => setFormCreate(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="usuario@ejemplo.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input type="password" value={formCreate.password} onChange={(e) => setFormCreate(f => ({ ...f, password: e.target.value }))} className="input-field" placeholder="Mínimo 6 caracteres" minLength={6} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input type="text" value={formCreate.full_name} onChange={(e) => setFormCreate(f => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select value={formCreate.role} onChange={(e) => setFormCreate(f => ({ ...f, role: e.target.value }))} className="input-field">
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">El rol Superusuario solo puede asignarse desde la base de datos.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateModal(false); setFormCreate({ email: '', password: '', full_name: '', role: ROLES.OPERATOR }) }} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" disabled={creating} className="flex-1 btn-primary">
                  {creating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay animate-fade-in" onClick={() => setEditingUser(null)}>
          <div className="modal-content max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Editar Usuario</h2>
              <button onClick={() => setEditingUser(null)} className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4 truncate">{editingUser.email}</p>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input type="text" value={formEdit.full_name} onChange={(e) => setFormEdit(f => ({ ...f, full_name: e.target.value }))} className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                {isSuperAdminEmail(editingUser.email) ? (
                  <p className="text-amber-700 font-semibold text-sm">🔒 Superusuario (no editable)</p>
                ) : (
                  <select value={formEdit.role} onChange={(e) => setFormEdit(f => ({ ...f, role: e.target.value }))} className="input-field">
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
              {!isSuperAdminEmail(editingUser.email) && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formEdit.active} onChange={(e) => setFormEdit(f => ({ ...f, active: e.target.checked }))} className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Usuario activo</span>
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={updatingId === editingUser.id} className="flex-1 btn-primary">
                {updatingId === editingUser.id ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
