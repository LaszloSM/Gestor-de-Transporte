import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequestsStore, useAuthStore } from '../stores'
import { useLoadRequests } from '../hooks/useLoadRequests'
import RequestTable from '../components/RequestTable'
import RequestFilters from '../components/RequestFilters'

export default function RequestsListPage() {
  const navigate = useNavigate()
  const { requests, loading, filters, setFilters, realtimeSubscription, getPaginatedRequests, currentPage, setCurrentPage } = useRequestsStore()
  const { hasPermission } = useAuthStore()
  useLoadRequests()

  const { data: paginatedData, total, totalPages } = getPaginatedRequests()

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Solicitudes</h1>
          {realtimeSubscription && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="live-dot" /> En vivo
            </span>
          )}
        </div>
        {hasPermission('create_request') && (
          <button onClick={() => navigate('/new-request')} className="btn-primary">
            + Nueva Solicitud
          </button>
        )}
      </div>

      {/* Filters */}
      <RequestFilters filters={filters} setFilters={(f) => { setFilters(f); setCurrentPage(1) }} />

      {/* Results info */}
      <p className="text-xs text-slate-500">
        {total} solicitud{total !== 1 ? 'es' : ''} encontrada{total !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      {paginatedData.length > 0 ? (
        <>
          <RequestTable requests={paginatedData} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                ← Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Sin solicitudes</h3>
          <p className="text-sm text-slate-500">Crea tu primera solicitud o ajusta los filtros.</p>
        </div>
      )}
    </div>
  )
}
