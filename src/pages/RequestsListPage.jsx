import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useRequestsStore } from '@/stores'
import { isSuperAdminEmail, VEHICLE_TYPE_LABELS, STATE_LABELS, buildWhatsAppMessage } from '@/config'
import { db } from '@/services/supabase'
import { StatusBadge } from '@/components/requests/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PlusCircle, Search, MoreVertical, UserPlus, Navigation, CheckCircle2, XCircle, MessageCircle, Eye, Phone, MapPin, Clock, Users as UsersIcon, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RequestsListPage() {
  const { user, userProfile } = useAuthStore()
  const { requests, setRequests, setLoading } = useRequestsStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [detailRequest, setDetailRequest] = useState(null)
  const [assignRequest, setAssignRequest] = useState(null)
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [users, setUsers] = useState([])
  const [assignTo, setAssignTo] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

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

  // Load users for assignment
  useEffect(() => {
    if (isAdmin) {
      db.getUsers().then(setUsers).catch(() => { })
    }
  }, [isAdmin])

  const filteredRequests = useMemo(() => {
    let list = [...requests]
    if (stateFilter !== 'all') list = list.filter((r) => r.state === stateFilter)
    if (vehicleFilter !== 'all') list = list.filter((r) => r.vehicle_type === vehicleFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) =>
        (r.passenger_name || '').toLowerCase().includes(q) ||
        (r.passenger_phone || '').includes(q) ||
        (r.origin || '').toLowerCase().includes(q) ||
        (r.destination || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [requests, stateFilter, vehicleFilter, search])

  const handleAssign = async () => {
    if (!driverName || !driverPhone || !assignRequest) return
    setActionLoading(true)
    try {
      const coordinatorId = assignTo || user.id
      await db.assignRequest(assignRequest.id, coordinatorId, { driver_name: driverName, driver_phone: driverPhone })
      toast.success(`Conductor ${driverName} asignado correctamente`)
      // Reload requests
      const data = await db.getRequests({}, user.id, effectiveRole)
      setRequests(data)
      setAssignRequest(null)
      setDriverName('')
      setDriverPhone('')
      setAssignTo('')
    } catch (err) {
      toast.error(err.message || 'Error al asignar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWhatsApp = (req) => {
    const phone = (req.driver_phone || '').replace(/[^0-9]/g, '')
    if (!phone) return
    const msg = encodeURIComponent(buildWhatsAppMessage(req))
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const handleStateChange = async (req, newState) => {
    setActionLoading(true)
    try {
      if (newState === 'in_route') {
        await db.setInRouteRequest(req.id)
      } else if (newState === 'completed') {
        await db.completeRequest(req.id, user.id)
      } else if (newState === 'cancelled') {
        await db.cancelRequest(req.id)
      } else if (newState === 'reopen') {
        await db.reopenRequest(req.id, effectiveRole)
      }
      toast.success(`Solicitud actualizada`)
      const data = await db.getRequests({}, user.id, effectiveRole)
      setRequests(data)
    } catch (err) {
      toast.error(err.message || 'Error al actualizar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (req) => {
    if (!confirm('¿Eliminar esta solicitud?')) return
    setActionLoading(true)
    try {
      await db.deleteRequest(req.id)
      toast.success('Solicitud eliminada')
      const data = await db.getRequests({}, user.id, effectiveRole)
      setRequests(data)
    } catch (err) {
      toast.error(err.message || 'Error al eliminar')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Solicitudes</h1>
          <p className="text-sm text-muted-foreground">Gestión de solicitudes de transporte</p>
        </div>
        <Button onClick={() => navigate('/new-request')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o teléfono..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignada</SelectItem>
                <SelectItem value="in_route">En Ruta</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="car">Automóvil</SelectItem>
                <SelectItem value="motorcycle">Motocicleta</SelectItem>
                <SelectItem value="van">Camioneta</SelectItem>
                <SelectItem value="bus">Autobús</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pasajero</TableHead>
                <TableHead className="hidden md:table-cell">Origen</TableHead>
                <TableHead className="hidden md:table-cell">Destino</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Hora</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailRequest(req)}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{req.passenger_name}</p>
                      <p className="text-xs text-muted-foreground">{req.passenger_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{req.origin}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{req.destination}</TableCell>
                  <TableCell className="text-sm">{VEHICLE_TYPE_LABELS[req.vehicle_type] || req.vehicle_type}</TableCell>
                  <TableCell><StatusBadge state={req.state} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{req.time}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {req.state === 'pending' && (
                            <DropdownMenuItem onClick={() => { setAssignRequest(req); setDriverName(''); setDriverPhone(''); setAssignTo(''); }}>
                              <UserPlus className="mr-2 h-4 w-4" /> Asignar Conductor
                            </DropdownMenuItem>
                          )}
                          {req.state === 'assigned' && (
                            <DropdownMenuItem onClick={() => handleStateChange(req, 'in_route')}>
                              <Navigation className="mr-2 h-4 w-4" /> Marcar en Ruta
                            </DropdownMenuItem>
                          )}
                          {(req.state === 'assigned' || req.state === 'in_route') && (
                            <DropdownMenuItem onClick={() => handleStateChange(req, 'completed')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Completar
                            </DropdownMenuItem>
                          )}
                          {(req.state === 'pending' || req.state === 'assigned') && (
                            <DropdownMenuItem onClick={() => handleStateChange(req, 'cancelled')}>
                              <XCircle className="mr-2 h-4 w-4" /> Cancelar
                            </DropdownMenuItem>
                          )}
                          {(req.state === 'completed' || req.state === 'cancelled') && (
                            <DropdownMenuItem onClick={() => handleStateChange(req, 'reopen')}>
                              <RotateCcw className="mr-2 h-4 w-4" /> Reabrir
                            </DropdownMenuItem>
                          )}
                          {req.driver_phone && (
                            <DropdownMenuItem onClick={() => handleWhatsApp(req)}>
                              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(req)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" /> Detalle de Solicitud
            </DialogTitle>
          </DialogHeader>
          {detailRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Pasajero</p>
                  <p className="text-sm font-medium">{detailRequest.passenger_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{detailRequest.passenger_phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Personas</p>
                  <p className="text-sm font-medium flex items-center gap-1"><UsersIcon className="h-3 w-3" />{detailRequest.quantity || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="text-sm font-medium">{VEHICLE_TYPE_LABELS[detailRequest.vehicle_type] || detailRequest.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Clock className="h-3 w-3" />{detailRequest.time || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <StatusBadge state={detailRequest.state} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Origen</p>
                <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{detailRequest.origin}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{detailRequest.destination}</p>
              </div>
              {detailRequest.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm">{detailRequest.notes}</p>
                </div>
              )}
              {detailRequest.driver_name && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Conductor Asignado</p>
                  <p className="text-sm font-medium">{detailRequest.driver_name}</p>
                  <p className="text-xs text-muted-foreground">{detailRequest.driver_phone}</p>
                </div>
              )}
              {detailRequest.created_by_user && (
                <div>
                  <p className="text-xs text-muted-foreground">Creado por</p>
                  <p className="text-sm font-medium">{detailRequest.created_by_user?.full_name || detailRequest.created_by_user?.email}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Modal */}
      <Dialog open={!!assignRequest} onOpenChange={() => setAssignRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Asignar Conductor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Solicitud de: <span className="font-medium text-foreground">{assignRequest?.passenger_name}</span></p>
            </div>
            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Asignar a usuario</Label>
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.active !== false).map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name || u.email} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre del conductor</Label>
              <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp del conductor</Label>
              <Input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="+57300..." />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAssignRequest(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!driverName || !driverPhone || actionLoading}>
              {actionLoading ? 'Asignando...' : 'Asignar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
