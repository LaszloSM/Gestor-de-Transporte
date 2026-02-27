import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useRequestsStore, useAuthStore } from '../stores'
import { useNavigate, Navigate } from 'react-router-dom'
import { db } from '../services/supabase'
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from '../config'

export default function NewRequestPage() {
  const navigate = useNavigate()
  const { addRequest } = useRequestsStore()
  const { user, hasPermission } = useAuthStore()
  const [loading, setLoading] = useState(false)

  if (!hasPermission('create_request')) {
    return <Navigate to="/requests" replace />
  }

  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_phone: '',
    quantity: 1,
    vehicle_type: VEHICLE_TYPES.CAR,
    origin: '',
    destination: '',
    time: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const errs = {}
    if (!formData.passenger_name.trim()) errs.passenger_name = 'El nombre es requerido'
    if (!formData.passenger_phone.trim()) errs.passenger_phone = 'El teléfono es requerido'
    else if (formData.passenger_phone.replace(/\D/g, '').length < 7) errs.passenger_phone = 'Número inválido'
    if (formData.quantity < 1) errs.quantity = 'Mínimo 1 pasajero'
    if (!formData.origin.trim()) errs.origin = 'La dirección de recogida es requerida'
    if (!formData.destination.trim()) errs.destination = 'El destino es requerido'
    if (!formData.time) errs.time = 'La hora es requerida'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: name === 'quantity' ? parseInt(value) || 1 : value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const created = await db.createRequest(formData, user.id)
      if (created) {
        addRequest(created)
        toast.success('¡Solicitud creada exitosamente!')
        navigate('/requests')
      } else {
        throw new Error('No se pudo crear la solicitud')
      }
    } catch (error) {
      toast.error(error.message || 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nueva Solicitud</h1>
        <p className="text-sm text-slate-500 mt-1">Registra una nueva solicitud de transporte para un votante.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 lg:p-8 space-y-6">
        {/* Passenger info */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
            Información del Votante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Nombre Completo <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="passenger_name"
                value={formData.passenger_name}
                onChange={handleChange}
                className={`input-field ${errors.passenger_name ? 'border-red-400' : ''}`}
                placeholder="Juan Pérez López"
              />
              {errors.passenger_name && <p className="form-error">{errors.passenger_name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="passenger_phone"
                value={formData.passenger_phone}
                onChange={handleChange}
                className={`input-field ${errors.passenger_phone ? 'border-red-400' : ''}`}
                placeholder="3001234567"
              />
              {errors.passenger_phone && <p className="form-error">{errors.passenger_phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Pasajeros <span className="text-red-500">*</span></label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={`input-field ${errors.quantity ? 'border-red-400' : ''}`} min="1" max="20" />
              {errors.quantity && <p className="form-error">{errors.quantity}</p>}
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="pt-5 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
            Ruta y Transporte
          </h2>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Dirección de Recogida <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className={`input-field ${errors.origin ? 'border-red-400' : ''}`}
                placeholder="Calle 10 #20-30, Barrio Centro"
              />
              {errors.origin && <p className="form-error">{errors.origin}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Puesto de Votación (Destino) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className={`input-field ${errors.destination ? 'border-red-400' : ''}`}
                placeholder="I.E. San José - Mesa 5"
              />
              {errors.destination && <p className="form-error">{errors.destination}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Tipo de Vehículo</label>
                <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="input-field">
                  {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hora de Recogida <span className="text-red-500">*</span></label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className={`input-field ${errors.time ? 'border-red-400' : ''}`} />
                {errors.time && <p className="form-error">{errors.time}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-5 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">3</span>
            Observaciones
          </h2>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              placeholder="Información adicional, indicaciones de ubicación, necesidades especiales..."
              rows="3"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-5 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/requests')} className="flex-1 btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Creando...
              </span>
            ) : 'Crear Solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}
