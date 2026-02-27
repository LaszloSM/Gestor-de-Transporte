import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { db } from '../services/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_LABELS = {
  CREATE: 'Creación',
  ASSIGN: 'Asignación',
  IN_ROUTE: 'En Ruta',
  COMPLETE: 'Completar',
  CANCEL: 'Cancelar',
  REOPEN: 'Reabrir',
  DELETE: 'Eliminar',
  UPDATE: 'Actualizar',
  USER_CREATE: 'Crear Usuario',
  ROLE_CHANGE: 'Cambio de Rol',
  USER_DEACTIVATE: 'Desactivar Usuario',
}

const ACTION_COLORS = {
  CREATE: 'badge-assigned',
  ASSIGN: 'badge-assigned',
  IN_ROUTE: 'badge-in_route',
  COMPLETE: 'badge-completed',
  CANCEL: 'badge-cancelled',
  REOPEN: 'badge-pending',
  DELETE: 'badge-cancelled',
  UPDATE: 'badge-pending',
  USER_CREATE: 'badge-completed',
  ROLE_CHANGE: 'badge-in_route',
}

const ACTION_FILTER_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'Creaciones' },
  { value: 'ASSIGN', label: 'Asignaciones' },
  { value: 'IN_ROUTE', label: 'En Ruta' },
  { value: 'COMPLETE', label: 'Completadas' },
  { value: 'CANCEL', label: 'Canceladas' },
  { value: 'DELETE', label: 'Eliminaciones' },
  { value: 'USER_CREATE', label: 'Usuarios Creados' },
]

export default function AuditPage() {
  const { hasPermission } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ action: '' })
  const [selectedLog, setSelectedLog] = useState(null)

  const canView = hasPermission('view_audit')

  useEffect(() => {
    if (!canView) return
    loadLogs()
  }, [canView, filters.action])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await db.getAuditLog(filters)
      setLogs(data || [])
    } catch (_) {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  if (!canView) return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registro de Auditoría</h1>
        <p className="text-sm text-slate-500 mt-0.5">Todas las acciones realizadas en el sistema.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filters.action || ''}
          onChange={(e) => setFilters({ ...filters, action: e.target.value || null })}
          className="input-field max-w-xs"
        >
          {ACTION_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-slate-900">Sin registros</h3>
          <p className="text-sm text-slate-500">No hay registros de auditoría con estos filtros.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Acción</th>
                  <th className="table-header">Recurso</th>
                  <th className="table-header text-right">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell text-xs text-slate-500 whitespace-nowrap">
                      {log.created_at ? format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: es }) : '—'}
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-medium">{log.user?.full_name || log.user?.email || '—'}</p>
                      <p className="text-xs text-slate-400">{log.user?.role || ''}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${ACTION_COLORS[log.action] || 'badge-pending'}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="text-xs text-slate-500">{log.resource_type || '—'}</p>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-[100px]" title={log.resource_id}>
                        {log.resource_id?.slice(0, 8) || '—'}
                      </p>
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-ghost text-xs text-indigo-600"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedLog(null)}>
          <div className="modal-content max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Detalle de Auditoría</h2>
              <button onClick={() => setSelectedLog(null)} className="btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Acción</p>
                  <span className={`badge ${ACTION_COLORS[selectedLog.action] || 'badge-pending'} mt-1`}>
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha</p>
                  <p className="font-medium">{selectedLog.created_at ? format(new Date(selectedLog.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es }) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Usuario</p>
                  <p className="font-medium">{selectedLog.user?.full_name || selectedLog.user?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo de Recurso</p>
                  <p className="font-medium">{selectedLog.resource_type || '—'}</p>
                </div>
              </div>

              {selectedLog.new_values && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-1">Valores Nuevos</p>
                  <pre className="bg-slate-50 rounded-xl p-3 text-xs overflow-auto max-h-48 text-slate-700">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.old_values && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Valores Anteriores</p>
                  <pre className="bg-slate-50 rounded-xl p-3 text-xs overflow-auto max-h-48 text-slate-700">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
