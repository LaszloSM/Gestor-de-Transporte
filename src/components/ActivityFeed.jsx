import React, { useEffect, useState } from 'react'
import { db } from '../services/supabase'
import { useAuthStore } from '../stores'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_LABELS = {
  CREATE: 'creó una solicitud',
  ASSIGN: 'asignó una solicitud',
  IN_ROUTE: 'puso en ruta',
  COMPLETE: 'completó una solicitud',
  CANCEL: 'canceló una solicitud',
  REOPEN: 'reabrió una solicitud',
  DELETE: 'eliminó una solicitud',
  UPDATE: 'actualizó una solicitud',
  USER_CREATE: 'creó un usuario',
  ROLE_CHANGE: 'cambió un rol',
}

const ACTION_ICONS = {
  CREATE: '📝',
  ASSIGN: '🔗',
  IN_ROUTE: '🚗',
  COMPLETE: '✅',
  CANCEL: '❌',
  REOPEN: '🔄',
  DELETE: '🗑️',
  UPDATE: '✏️',
  USER_CREATE: '👤',
  ROLE_CHANGE: '🔑',
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuthStore()
  const canViewAudit = hasPermission('view_audit')

  useEffect(() => {
    if (!canViewAudit) {
      setLoading(false)
      return
    }
    const loadLogs = async () => {
      try {
        const data = await db.getAuditLog({})
        setLogs((data || []).slice(0, 8))
      } catch (_) {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [canViewAudit])

  if (!canViewAudit) return null

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="live-dot" />
        Actividad Reciente
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="spinner-sm" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">Sin actividad reciente</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <span className="text-base mt-0.5 shrink-0">{ACTION_ICONS[log.action] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 leading-snug">
                  <span className="font-semibold">{log.user?.full_name || log.user?.email || 'Sistema'}</span>
                  {' '}
                  <span className="text-slate-500">{ACTION_LABELS[log.action] || log.action}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {log.created_at ? format(new Date(log.created_at), "d MMM, HH:mm", { locale: es }) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
