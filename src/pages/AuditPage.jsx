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
        <div className="hidden md:block overflow-x-auto">
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

        {/* Mobile View - Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {logs.map((log) => (
            <Card key={log.id} className="shadow-sm">
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{log.action}</span>
                    <Badge variant="outline" className="text-[10px] leading-none px-1.5 py-0.5">{log.resource_type || '—'}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="text-foreground font-medium">Por:</span> {log.user?.full_name || log.user?.email || '—'}
                  </span>
                  {log.new_values && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md mt-1 truncate">
                      {JSON.stringify(log.new_values)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {logs.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
              No hay registros de auditoría
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
