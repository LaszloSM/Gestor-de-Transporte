import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore, useAuthStore } from '../stores'
import { isSuperAdminEmail, ROLE_LABELS } from '../config'

const NAV_ITEMS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['superadmin', 'admin', 'coordinator', 'operator'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    label: 'Solicitudes',
    path: '/requests',
    roles: ['superadmin', 'admin', 'coordinator', 'operator'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
      </svg>
    ),
    label: 'Nueva Solicitud',
    path: '/new-request',
    roles: ['superadmin', 'admin', 'operator'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Usuarios',
    path: '/users',
    roles: ['superadmin', 'admin'],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Auditoría',
    path: '/audit',
    roles: ['superadmin', 'admin'],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { userProfile, user } = useAuthStore()

  const currentEmail = userProfile?.email || user?.email
  const effectiveRole = isSuperAdminEmail(currentEmail) ? 'superadmin' : userProfile?.role
  const roleLabel = ROLE_LABELS[effectiveRole] || effectiveRole

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(effectiveRole))

  return (
    <>
      <aside
        className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'
          } bg-sidebar-bg flex flex-col h-screen transition-all duration-300 ease-out shrink-0 z-30`}
        style={{ willChange: 'width' }}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight truncate">Transporte</p>
              <p className="text-sidebar-text text-xs truncate">Electoral</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative ${isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
                  }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <span className={`shrink-0 transition-colors ${isActive ? 'text-indigo-400' : ''}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-sidebar-border shrink-0">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {(userProfile?.full_name || currentEmail || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {userProfile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
              </div>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="px-3 pb-3 shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-all"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-20 animate-fade-in"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
