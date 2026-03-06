import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { db, supabase } from '../services/supabase'
import { useAuthStore } from '../stores'
import { buildWhatsAppMessage, isSuperAdminEmail } from '../config'

export default function AssignmentModal({ request, isOpen, onClose, onAssign }) {
  const [loading, setLoading] = useState(false)
  const [coordinators, setCoordinators] = useState([])
  const [selectedCoordinator, setSelectedCoordinator] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const { userProfile, user } = useAuthStore()

  const currentEmail = userProfile?.email || user?.email
  const isAdminOrAbove = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || isSuperAdminEmail(currentEmail)

  useEffect(() => {
    if (isOpen) {
      setDriverName(request?.driver_name || '')
      setDriverPhone(request?.driver_phone || '')
      if (isAdminOrAbove) {
        loadCoordinators()
      } else {
        setSelectedCoordinator(userProfile?.id || user?.id || '')
      }
    }
  }, [isOpen])

  const loadCoordinators = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, active')
        .in('role', ['usuario', 'admin', 'superadmin'])
      if (error) throw error
      const list = (data || []).filter((u) => u.active !== false)
      setCoordinators(list)
      if (list.length > 0 && !selectedCoordinator) {
        setSelectedCoordinator(list[0].id)
      }
    } catch (_) {
      toast.error('Error al cargar usuarios')
    }
  }

  const handleAssign = async () => {
    const coordinatorId = isAdminOrAbove ? selectedCoordinator : (userProfile?.id || user?.id)
    if (isAdminOrAbove && !coordinatorId) {
      toast.error('Selecciona un responsable')
      return
    }

    const dName = driverName.trim()
    const dPhone = driverPhone.replace(/\D/g, '').trim()
    if (!dName) { toast.error('Escribe el nombre del conductor'); return }
    if (!dPhone) { toast.error('Escribe el WhatsApp del conductor'); return }
    if (dPhone.length < 7) { toast.error('Número de WhatsApp inválido'); return }

    setLoading(true)
    try {
      const updated = await db.assignRequest(request.id, coordinatorId, { driver_name: dName, driver_phone: dPhone })

      try {
        const message = buildWhatsAppMessage(request)
        const url = `https://wa.me/${dPhone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
        await db.addWhatsAppMessage({
          request_id: request.id,
          recipient: dPhone,
          message_type: 'assignment',
          message_content: message,
          status: 'sent',
        })
      } catch (_) { }

      toast.success('Solicitud asignada. WhatsApp abierto.')
      onAssign(updated)
      onClose()
    } catch (error) {
      toast.error(error.message || 'Error al asignar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Asignar Transporte</h2>
              <p className="text-sm text-slate-500 mt-0.5">Asigna un conductor a esta solicitud.</p>
            </div>
            <button onClick={onClose} className="btn-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Request summary */}
        <div className="mx-6 mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="space-y-1.5 text-sm">
            <p><span className="font-medium text-slate-500">Votante:</span> <span className="text-slate-900">{request?.passenger_name}</span></p>
            <p><span className="font-medium text-slate-500">Recogida:</span> <span className="text-slate-900">{request?.origin}</span></p>
            <p><span className="font-medium text-slate-500">Destino:</span> <span className="text-slate-900">{request?.destination}</span></p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Coordinator select (admin/superadmin only) */}
          {isAdminOrAbove && (
            <div className="form-group">
              <label className="form-label">Responsable</label>
              {coordinators.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  No hay usuarios activos disponibles.
                </p>
              ) : (
                <select
                  value={selectedCoordinator}
                  onChange={(e) => setSelectedCoordinator(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Seleccionar —</option>
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nombre del Conductor</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="input-field"
              placeholder="Nombre del conductor"
            />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp del Conductor</label>
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="input-field"
              placeholder="Ej: 573001234567"
            />
            <p className="text-xs text-slate-400 mt-1">Incluye código de país (57 para Colombia)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || (isAdminOrAbove && !selectedCoordinator)}
            className="flex-1 btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Asignando...
              </span>
            ) : 'Asignar y Enviar WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
