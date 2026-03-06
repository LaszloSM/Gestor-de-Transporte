import { useState } from 'react'
import { useAuthStore } from '@/stores'
import { isSuperAdminEmail, ROLE_LABELS } from '@/config'
import { db } from '@/services/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { userProfile, user, setUserProfile } = useAuthStore()
  const [name, setName] = useState(userProfile?.full_name || '')
  const [loading, setLoading] = useState(false)

  const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
    ? 'superadmin'
    : userProfile?.role

  const handleSave = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const updated = await db.updateUserProfile(user.id, { full_name: name.trim() })
      if (updated) setUserProfile(updated)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.message || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const roleBadgeVariant = effectiveRole === 'superadmin' ? 'destructive' : effectiveRole === 'admin' ? 'default' : 'secondary'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Información de tu cuenta</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{userProfile?.full_name || user?.email}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={roleBadgeVariant} className="text-xs capitalize">
                  {ROLE_LABELS[effectiveRole] || effectiveRole}
                </Badge>
                <span className="text-xs text-muted-foreground">{userProfile?.email || user?.email}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input value={userProfile?.email || user?.email || ''} disabled className="opacity-60" />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
