import React, { useEffect, useState } from 'react'
import { db } from '../services/supabase'
import toast from 'react-hot-toast'

export default function WhatsAppHistory({ requestId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await db.getWhatsAppHistory(requestId)
        if (!cancelled) setMessages(data || [])
      } catch (error) {
        console.error('Error cargando historial de WhatsApp', error)
        toast.error('No se pudo cargar el historial de WhatsApp')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (requestId) load()
    return () => { cancelled = true }
  }, [requestId])

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando historial...</p>
  }
  if (messages.length === 0) {
    return <p className="text-sm text-slate-500">No hay mensajes registrados.</p>
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500">{new Date(msg.sent_at).toLocaleString()}</span>
            <span className="text-xs font-medium capitalize text-slate-700">{msg.message_type}</span>
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-line">{msg.message_content}</div>
        </div>
      ))}
    </div>
  )
}
