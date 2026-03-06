import React, { useState } from 'react'
import { STATE_LABELS, VEHICLE_TYPE_LABELS } from '../config'
import RequestActions from './RequestActions'

export default function RequestTable({ requests }) {
  const [selectedRequest, setSelectedRequest] = useState(null)

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="table-header">Votante</th>
                <th className="table-header">Teléfono</th>
                <th className="table-header">Recogida</th>
                <th className="table-header">Destino</th>
                <th className="table-header">Hora</th>
                <th className="table-header">Estado</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRequest(request)}
                >
                  <td className="table-cell">
                    <div className="max-w-[140px]">
                      <p className="font-medium text-slate-900 truncate">{request.passenger_name}</p>
                    </div>
                  </td>
                  <td className="table-cell text-slate-600">{request.passenger_phone || '—'}</td>
                  <td className="table-cell text-slate-600 max-w-[120px] truncate" title={request.origin}>{request.origin || '—'}</td>
                  <td className="table-cell text-slate-600 max-w-[120px] truncate" title={request.destination}>{request.destination || '—'}</td>
                  <td className="table-cell">{request.time || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge badge-${request.state}`}>
                      {STATE_LABELS[request.state] || request.state}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <RequestActions request={request} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRequest.passenger_name}</h2>
                  <span className={`badge badge-${selectedRequest.state} mt-2`}>
                    {STATE_LABELS[selectedRequest.state] || selectedRequest.state}
                  </span>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="btn-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Teléfono" value={selectedRequest.passenger_phone} />
                <Detail label="Recogida" value={selectedRequest.origin} />
                <Detail label="Destino" value={selectedRequest.destination} />
                <Detail label="Vehículo" value={VEHICLE_TYPE_LABELS[selectedRequest.vehicle_type] || selectedRequest.vehicle_type} />
                <Detail label="Hora" value={selectedRequest.time} />
                <Detail label="Cantidad" value={selectedRequest.quantity} />
                {selectedRequest.driver_name && (
                  <Detail label="Conductor" value={selectedRequest.driver_name} />
                )}
                {selectedRequest.driver_phone && (
                  <Detail label="WhatsApp Conductor" value={selectedRequest.driver_phone} />
                )}
                <Detail label="Creado por" value={selectedRequest.created_by_user?.full_name || selectedRequest.created_by_user?.email || '—'} />
                {selectedRequest.assigned_to_user && (
                  <Detail label="Asignado por" value={selectedRequest.assigned_to_user?.full_name || selectedRequest.assigned_to_user?.email} />
                )}
              </div>

              {selectedRequest.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Observaciones</p>
                  <p className="text-sm text-slate-700">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-xs text-slate-400">
              <p>Creado: {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString('es-CO') : '—'}</p>
              {selectedRequest.completed_at && (
                <p>Completado: {new Date(selectedRequest.completed_at).toLocaleString('es-CO')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-slate-900 font-medium mt-0.5 break-words">{value || '—'}</p>
    </div>
  )
}
