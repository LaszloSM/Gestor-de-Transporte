import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { isSuperAdminEmail, SUPER_ADMIN_EMAIL, ROLE_LABELS } from '@/config'
import { db } from '@/services/supabase'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Users as UsersIcon, Shield, User, PlusCircle, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Navigate } from 'react-router-dom'

export default function UsersPage() {
  const { userProfile, user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'usuario' })
  const [actionLoading, setActionLoading] = useState(false)

  const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
    ? 'superadmin'
    : userProfile?.role
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'superadmin'
  const isSuperAdmin = effectiveRole === 'superadmin'

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await db.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length,
    users: users.filter((u) => u.role === 'usuario').length,
  }

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Completa los campos requeridos')
      return
    }
    setActionLoading(true)
    try {
      await db.createUser(newUser.email, newUser.password, newUser.full_name, newUser.role)
      toast.success(`Usuario ${newUser.email} creado`)
      setCreateOpen(false)
      setNewUser({ email: '', password: '', full_name: '', role: 'usuario' })
      await loadUsers()
    } catch (err) {
      toast.error(err.message || 'Error al crear usuario')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setActionLoading(true)
    try {
      await db.updateUserProfile(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
        active: editUser.active,
      })
      toast.success('Usuario actualizado')
      setEditUser(null)
      await loadUsers()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar')
    } finally {
      setActionLoading(false)
    }
  }

  const roleBadge = (role) => {
    const styles = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      usuario: 'bg-emerald-100 text-emerald-800',
    }
    return <Badge variant="secondary" className={`text-xs ${styles[role] || ''}`}>{ROLE_LABELS[role] || role}</Badge>
  }

  const isProtectedUser = (u) => isSuperAdminEmail(u.email)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administración de usuarios del sistema</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Usuarios" value={stats.total} icon={UsersIcon} />
        <StatCard title="Administradores" value={stats.admins} icon={Shield} />
        <StatCard title="Usuarios" value={stats.users} icon={User} />
      </div>

      <Card className="shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-sm">{u.full_name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.active !== false ? 'secondary' : 'outline'}
                      className={`text-xs ${u.active !== false ? 'bg-emerald-100 text-emerald-800' : 'text-muted-foreground'}`}
                    >
                      {u.active !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!isProtectedUser(u) && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditUser({ ...u })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View - Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {users.map((u) => (
            <Card key={u.id} className="shadow-sm">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-base leading-none truncate">{u.full_name || 'Usuario'}</h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{u.email}</p>
                  </div>
                  {!isProtectedUser(u) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-2 -mt-2" onClick={() => setEditUser({ ...u })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  {roleBadge(u.role)}
                  <Badge
                    variant={u.active !== false ? 'secondary' : 'outline'}
                    className={`text-xs ${u.active !== false ? 'bg-emerald-100 text-emerald-800' : 'text-muted-foreground'}`}
                  >
                    {u.active !== false ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
          {users.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </Card>

      {/* Create User Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /> Crear Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Contraseña *</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Editar Usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input value={editUser.full_name || ''} onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Activo</Label>
                <Switch checked={editUser.active !== false} onCheckedChange={(v) => setEditUser({ ...editUser, active: v })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={actionLoading}>
              {actionLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
