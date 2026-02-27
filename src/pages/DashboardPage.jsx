import React from 'react'
import { useRequestsStore, useAuthStore } from '../stores'
import { useLoadRequests } from '../hooks/useLoadRequests'
import { ROLE_LABELS } from '../config'
import { isSuperAdminEmail } from '../config'
import StatCard from '../components/StatCard'
import DonutChart from '../components/DonutChart'
import ActivityFeed from '../components/ActivityFeed'
import RecentRequests from '../components/RecentRequests'

export default function DashboardPage() {
  const { userProfile, user } = useAuthStore()
  const { requests, loading } = useRequestsStore()
  useLoadRequests()

  const currentEmail = userProfile?.email || user?.email
  const effectiveRole = isSuperAdminEmail(currentEmail) ? 'superadmin' : userProfile?.role
  const roleLabel = ROLE_LABELS[effectiveRole] || effectiveRole

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.state === 'pending').length,
    assigned: requests.filter((r) => r.state === 'assigned').length,
    in_route: requests.filter((r) => r.state === 'in_route').length,
    completed: requests.filter((r) => r.state === 'completed').length,
    cancelled: requests.filter((r) => r.state === 'cancelled').length,
  }

  const chartData = [
    { label: 'Pendientes', value: stats.pending },
    { label: 'Asignadas', value: stats.assigned },
    { label: 'En Ruta', value: stats.in_route },
    { label: 'Completadas', value: stats.completed },
    { label: 'Canceladas', value: stats.cancelled },
  ]

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Hola, <span className="font-medium text-slate-700">{userProfile?.full_name || 'Usuario'}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {roleLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-stagger">
        <StatCard title="Total" value={stats.total} icon="📋" colorClass="stat-blue" />
        <StatCard title="Pendientes" value={stats.pending} icon="⏳" colorClass="stat-amber" />
        <StatCard title="Asignadas" value={stats.assigned} icon="🔗" colorClass="stat-sky" />
        <StatCard title="En Ruta" value={stats.in_route} icon="🚗" colorClass="stat-violet" />
        <StatCard title="Completadas" value={stats.completed} icon="✅" colorClass="stat-emerald" />
        <StatCard title="Canceladas" value={stats.cancelled} icon="❌" colorClass="stat-red" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-900 mb-4 self-start">Distribución</h3>
          <DonutChart data={chartData} />
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-1">
          <RecentRequests />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
