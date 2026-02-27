import { useEffect, useCallback } from 'react'
import { useRequestsStore, useAuthStore } from '../stores'
import { db, realtime } from '../services/supabase'
import { isSuperAdminEmail } from '../config'

export const useLoadRequests = () => {
  const { setRequests, setLoading, setError, setRealtimeSubscription } = useRequestsStore()
  const { userProfile, user } = useAuthStore()

  // Compute effective role (superadmin overrides)
  const currentEmail = userProfile?.email || user?.email
  const effectiveRole = isSuperAdminEmail(currentEmail)
    ? 'superadmin'
    : (userProfile?.role || 'operator')

  const userId = userProfile?.id

  const loadRequests = useCallback(async (silent = false) => {
    if (!userId) return
    if (!silent) setLoading(true)
    try {
      const data = await db.getRequests({}, userId, effectiveRole)
      setRequests(data || [])
      setError(null)
    } catch (error) {
      console.error('Error loading requests:', error)
      setError(error.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [userId, effectiveRole, setRequests, setLoading, setError])

  // Carga inicial y cuando cambia el usuario
  useEffect(() => {
    if (!userId) return
    loadRequests()
  }, [userId, effectiveRole, loadRequests])

  // Tiempo real: ante cualquier cambio, volver a cargar la lista
  useEffect(() => {
    if (!userId) return

    const handleRealtimeUpdate = () => {
      loadRequests(true)
    }

    const subscription = realtime.subscribeToRequests(handleRealtimeUpdate)
    setRealtimeSubscription(subscription)

    return () => {
      if (subscription) {
        realtime.unsubscribe(subscription)
      }
    }
  }, [userId, loadRequests, setRealtimeSubscription])
}
