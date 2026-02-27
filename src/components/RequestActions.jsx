import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { db } from '../services/supabase'
import { useAuthStore, useRequestsStore } from '../stores'
import { buildWhatsAppMessage } from '../config'
import AssignmentModal from './AssignmentModal'
import ConfirmDialog from './ConfirmDialog'

export default function RequestActions({ request }) {
  const { userProfile, hasPermission, getEffectiveRole } = useAuthStore()
  const { updateRequest, deleteRequest } = useRequestsStore()
  const [showAssign, setShowAssign] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // { type, title, message, variant }
  const [loading, setLoading] = useState(false)

  const effectiveRole = getEffectiveRole()
  const canAssign = hasPermission('assign_transport') && request.state === 'pending'
  const canInRoute = hasPermission('set_in_route') && request.state === 'assigned'
  const canComplete = hasPermission('complete_request') && ['assigned', 'in_route'].includes(request.state)
  const canCancel = hasPermission('cancel_request') && !['completed', 'cancelled'].includes(request.state)
  const canReopen = hasPermission('complete_request') && ['completed', 'cancelled'].includes(request.state) && (effectiveRole === 'admin' || effectiveRole === 'superadmin')
  const canDelete = hasPermission('delete_request')
  const canWhatsApp = hasPermission('send_whatsapp') && request.state === 'assigned' && request.driver_phone

  const handleAction = async () => {
    if (!confirmAction) return
    setLoading(true)
    try {
      switch (confirmAction.type) {
        case 'in_route': {
          const updated = await db.setInRouteRequest(request.id)
          updateRequest(request.id, updated)
          toast.success('Solicitud en ruta')
          break
        }
        case 'complete': {
          const updated = await db.completeRequest(request.id, userProfile.id)
          updateRequest(request.id, updated)
          toast.success('Solicitud completada')
          break
        }
        case 'cancel': {
          const updated = await db.cancelRequest(request.id)
          updateRequest(request.id, updated)
          toast.success('Solicitud cancelada')
          break
        }
        case 'reopen': {
          const updated = await db.reopenRequest(request.id, effectiveRole)
          updateRequest(request.id, updated)
          toast.success('Solicitud reabierta')
          break
        }
        case 'delete': {
          await db.deleteRequest(request.id)
          deleteRequest(request.id)
          toast.success('Solicitud eliminada')
          break
        }
      }
    } catch (error) {
      toast.error(error.message || 'Error al procesar la acción')
    } finally {
      setLoading(false)
      setConfirmAction(null)
    }
  }

  const handleWhatsApp = () => {
    const phone = request.driver_phone?.replace(/\D/g, '')
    if (!phone) {
      toast.error('No hay teléfono de conductor asignado')
      return
    }
    const message = buildWhatsAppMessage(request)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')

    // Log message
    try {
      db.addWhatsAppMessage({
        request_id: request.id,
        recipient: phone,
        message_type: 'assignment',
        message_content: message,
        status: 'sent',
      })
    } catch (_) { /* best effort */ }
  }

  const handleAssigned = (updated) => {
    updateRequest(request.id, updated)
  }

  const noActions = !canAssign && !canInRoute && !canComplete && !canCancel && !canReopen && !canDelete && !canWhatsApp
  if (noActions) return <span className="text-xs text-slate-400">—</span>

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        {canAssign && (
          <button onClick={() => setShowAssign(true)} className="btn-ghost text-xs text-indigo-600 hover:bg-indigo-50" title="Asignar">
            Asignar
          </button>
        )}
        {canInRoute && (
          <button
            onClick={() => setConfirmAction({
              type: 'in_route',
              title: 'Poner en ruta',
              message: `¿Confirmar que "${request.passenger_name}" está en ruta?`,
              variant: 'primary',
            })}
            className="btn-ghost text-xs text-violet-600 hover:bg-violet-50"
          >
            En Ruta
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => setConfirmAction({
              type: 'complete',
              title: 'Completar solicitud',
              message: `¿Confirmar que "${request.passenger_name}" ha sido transportado?`,
              variant: 'success',
            })}
            className="btn-ghost text-xs text-emerald-600 hover:bg-emerald-50"
          >
            Completar
          </button>
        )}
        {canWhatsApp && (
          <button onClick={handleWhatsApp} className="btn-ghost text-xs text-green-600 hover:bg-green-50" title="WhatsApp">
            📱
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setConfirmAction({
              type: 'cancel',
              title: 'Cancelar solicitud',
              message: `¿Estás seguro de cancelar la solicitud de "${request.passenger_name}"?`,
              variant: 'danger',
            })}
            className="btn-ghost text-xs text-red-600 hover:bg-red-50"
          >
            Cancelar
          </button>
        )}
        {canReopen && (
          <button
            onClick={() => setConfirmAction({
              type: 'reopen',
              title: 'Reabrir solicitud',
              message: `¿Reabrir la solicitud de "${request.passenger_name}"?`,
              variant: 'primary',
            })}
            className="btn-ghost text-xs text-amber-600 hover:bg-amber-50"
          >
            Reabrir
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setConfirmAction({
              type: 'delete',
              title: 'Eliminar solicitud',
              message: `¿Eliminar permanentemente la solicitud de "${request.passenger_name}"? Esta acción no se puede deshacer.`,
              variant: 'danger',
            })}
            className="btn-ghost text-xs text-red-600 hover:bg-red-50"
          >
            🗑
          </button>
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        request={request}
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        onAssign={handleAssigned}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        variant={confirmAction?.variant}
        onConfirm={handleAction}
        onCancel={() => setConfirmAction(null)}
        loading={loading}
      />
    </>
  )
}
