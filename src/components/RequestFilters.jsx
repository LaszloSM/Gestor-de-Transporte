import React from 'react'
import { REQUEST_STATES, STATE_LABELS } from '../config'

const ALL_STATES = [
  { key: null, label: 'Todas' },
  { key: REQUEST_STATES.PENDING, label: STATE_LABELS[REQUEST_STATES.PENDING] },
  { key: REQUEST_STATES.ASSIGNED, label: STATE_LABELS[REQUEST_STATES.ASSIGNED] },
  { key: REQUEST_STATES.IN_ROUTE, label: STATE_LABELS[REQUEST_STATES.IN_ROUTE] },
  { key: REQUEST_STATES.COMPLETED, label: STATE_LABELS[REQUEST_STATES.COMPLETED] },
  { key: REQUEST_STATES.CANCELLED, label: STATE_LABELS[REQUEST_STATES.CANCELLED] },
]

export default function RequestFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, dirección, teléfono..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="input-field pl-10"
        />
      </div>
      {/* State filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {ALL_STATES.map((s) => (
          <button
            key={s.key ?? 'all'}
            type="button"
            onClick={() => setFilters({ state: s.key })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filters.state === s.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
