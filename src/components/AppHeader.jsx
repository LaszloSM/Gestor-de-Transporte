import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores'
import { isSuperAdminEmail } from '@/config'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
    const { userProfile, user, logout } = useAuthStore()
    const navigate = useNavigate()

    const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
        ? 'superadmin'
        : userProfile?.role

    const displayName = userProfile?.full_name || user?.email || 'Usuario'

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (_) { /* ignore */ }
        logout()
        navigate('/login')
    }

    const roleBadgeVariant = effectiveRole === 'superadmin' ? 'destructive' : effectiveRole === 'admin' ? 'default' : 'secondary'

    return (
        <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-3">
                <Badge variant={roleBadgeVariant} className="text-xs capitalize">
                    {effectiveRole || 'usuario'}
                </Badge>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    )
}
