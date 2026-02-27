import React from 'react'
import { useRequestsStore } from '../stores'
import { STATE_LABELS } from '../config'

export default function RecentRequests() {
  const { requests } = useRequestsStore()
  const recent = requests.slice(0, 5)

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Solicitudes Recientes</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">Sin solicitudes</p>
      ) : (
        <div className="space-y-3">
          {recent.map((req) => (
            <div key={req.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{req.passenger_name}</p>
                <p className="text-xs text-slate-500 truncate">{req.origin} → {req.destination}</p>
              </div>
              <span className={`badge badge-${req.state}`}>
                {STATE_LABELS[req.state] || req.state}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
