import { useEffect, useMemo } from 'react'
import { useAuthStore, useRequestsStore } from '@/stores'
import { isSuperAdminEmail } from '@/config'
import { db } from '@/services/supabase'
import { StatCard } from '@/components/dashboard/StatCard'
import { RequestsDonut } from '@/components/dashboard/RequestsDonut'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user, userProfile } = useAuthStore()
  const { requests, setRequests, setLoading } = useRequestsStore()

  const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
    ? 'superadmin'
    : userProfile?.role
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'superadmin'

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      try {
        const data = await db.getRequests({}, user.id, effectiveRole)
        setRequests(data)
      } catch (err) {
        console.error('Error loading requests:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, effectiveRole, setRequests, setLoading])

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.state === 'pending').length,
    completed: requests.filter((r) => r.state === 'completed').length,
    cancelled: requests.filter((r) => r.state === 'cancelled').length,
  }), [requests])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general del transporte electoral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Solicitudes" value={stats.total} icon={FileText} />
        <StatCard title="Pendientes" value={stats.pending} icon={Clock} color="pending" />
        <StatCard title="Completadas" value={stats.completed} icon={CheckCircle2} color="completed" />
        <StatCard title="Canceladas" value={stats.cancelled} icon={XCircle} color="cancelled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RequestsDonut requests={requests} />
        <RecentActivity requests={requests} />
      </div>
    </div>
  )
}
