import { create } from 'zustand'
import { ROLES, ROLE_PERMISSIONS, isSuperAdminEmail } from '../config'

function getCurrentEmail(state) {
  return state.userProfile?.email || state.user?.email
}

function checkIsSuperAdmin(state) {
  return isSuperAdminEmail(getCurrentEmail(state))
}

function getEffectiveRole(state) {
  if (checkIsSuperAdmin(state)) return ROLES.SUPERADMIN
  return state.userProfile?.role || null
}

// ─── Auth Store ──────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: () => set({ user: null, session: null, userProfile: null }),

  getEffectiveRole: () => getEffectiveRole(get()),

  isSuperAdmin: () => checkIsSuperAdmin(get()),

  isAdminOrAbove: () => {
    const role = getEffectiveRole(get())
    return role === ROLES.SUPERADMIN || role === ROLES.ADMIN
  },

  hasPermission: (permission) => {
    const role = getEffectiveRole(get())
    if (!role) return false
    return ROLE_PERMISSIONS[role]?.[permission] ?? false
  },

  hasRole: (roleToCheck) => {
    const role = getEffectiveRole(get())
    return role === roleToCheck
  },
}))

// ─── Requests Store ──────────────────────────────────
export const useRequestsStore = create((set, get) => ({
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  filters: {
    state: null,
    search: '',
  },
  realtimeSubscription: null,
  currentPage: 1,
  pageSize: 10,

  setRequests: (requests) => set({ requests }),
  setSelectedRequest: (request) => set({ selectedRequest: request }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setRealtimeSubscription: (sub) => set({ realtimeSubscription: sub }),
  setCurrentPage: (page) => set({ currentPage: page }),

  addRequest: (request) => {
    set((state) => ({ requests: [request, ...state.requests] }))
  },

  updateRequest: (id, updates) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
      selectedRequest:
        state.selectedRequest?.id === id
          ? { ...state.selectedRequest, ...updates }
          : state.selectedRequest,
    }))
  },

  deleteRequest: (id) => {
    set((state) => ({
      requests: state.requests.filter((req) => req.id !== id),
      selectedRequest: state.selectedRequest?.id === id ? null : state.selectedRequest,
    }))
  },

  getFilteredRequests: () => {
    const { requests, filters } = get()
    let filtered = requests

    if (filters.state) {
      filtered = filtered.filter((req) => req.state === filters.state)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (req) =>
          (req.passenger_name || '').toLowerCase().includes(search) ||
          (req.origin || '').toLowerCase().includes(search) ||
          (req.destination || '').toLowerCase().includes(search) ||
          (req.passenger_phone || '').includes(search) ||
          (req.driver_name || '').toLowerCase().includes(search)
      )
    }

    return filtered
  },

  getPaginatedRequests: () => {
    const filtered = get().getFilteredRequests()
    const { currentPage, pageSize } = get()
    const start = (currentPage - 1) * pageSize
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      currentPage,
    }
  },

  getStats: () => {
    const { requests } = get()
    return {
      total: requests.length,
      pending: requests.filter((r) => r.state === 'pending').length,
      assigned: requests.filter((r) => r.state === 'assigned').length,
      in_route: requests.filter((r) => r.state === 'in_route').length,
      completed: requests.filter((r) => r.state === 'completed').length,
      cancelled: requests.filter((r) => r.state === 'cancelled').length,
    }
  },
}))

// ─── UI Store ────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// ─── Modal Store ─────────────────────────────────────
export const useModalStore = create((set, get) => ({
  modals: {},

  openModal: (key, data = null) =>
    set((state) => ({
      modals: { ...state.modals, [key]: { open: true, data } },
    })),

  closeModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: { open: false, data: null } },
    })),

  isOpen: (key) => get().modals[key]?.open ?? false,
  getModalData: (key) => get().modals[key]?.data ?? null,
}))
