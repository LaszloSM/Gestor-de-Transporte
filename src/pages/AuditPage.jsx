import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { isSuperAdminEmail } from '@/config'
import { db } from '@/services/supabase'
import { Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'

export default function AuditPage() {
  const { userProfile, user } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
    ? 'superadmin'
    : userProfile?.role
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'superadmin'

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      try {
        const data = await db.getAuditLog()
        setLogs(data)
      } catch (err) {
        console.error('Error loading audit logs:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Auditoría
        </h1>
        <p className="text-sm text-muted-foreground">Registro de cambios del sistema</p>
      </div>

      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead className="hidden md:table-cell">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-sm">
                    {log.user?.full_name || log.user?.email || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{log.resource_type || '—'}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[300px] truncate">
                    {log.new_values ? JSON.stringify(log.new_values) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay registros de auditoría
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
