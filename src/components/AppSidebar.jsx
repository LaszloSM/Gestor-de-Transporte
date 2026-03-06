import { LayoutDashboard, FileText, PlusCircle, Users, ClipboardList, Vote } from 'lucide-react'
import { NavLink } from '@/components/NavLink'
import { useAuthStore } from '@/stores'
import { isSuperAdminEmail } from '@/config'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar'

const mainNav = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Solicitudes', url: '/requests', icon: FileText },
    { title: 'Nueva Solicitud', url: '/new-request', icon: PlusCircle },
]

const adminNav = [
    { title: 'Usuarios', url: '/users', icon: Users },
    { title: 'Auditoría', url: '/audit', icon: ClipboardList },
]

export function AppSidebar() {
    const { userProfile, user } = useAuthStore()
    const { state } = useSidebar()
    const collapsed = state === 'collapsed'

    const effectiveRole = isSuperAdminEmail(userProfile?.email || user?.email)
        ? 'superadmin'
        : userProfile?.role
    const isAdmin = effectiveRole === 'admin' || effectiveRole === 'superadmin'

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Vote className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-sidebar-foreground">Transporte</span>
                            <span className="text-xs text-muted-foreground">Electoral</span>
                        </div>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administración</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminNav.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-primary font-medium">
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {!collapsed && <span>{item.title}</span>}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    )
}
