"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UseEnhancedAuthOptions {
  requireSeller?: boolean
  redirectOnFail?: string
  showToasts?: boolean
  onAuthenticationFailed?: (reason: string) => void
  onSessionRefreshed?: () => void
}

export function useEnhancedAuth(options: UseEnhancedAuthOptions = {}) {
  const {
    requireSeller = false,
    redirectOnFail = "/login",
    showToasts = true,
    onAuthenticationFailed,
    onSessionRefreshed
  } = options

  const { user, isAuthenticated, isLoading, isSeller, validateSession, refreshSession } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Enhanced authentication check with session validation
  const checkAuthenticationWithSession = useCallback(async (): Promise<{
    isValid: boolean
    reason?: string
    user?: any
  }> => {
    try {
      // First check if we're still loading
      if (isLoading) {
        return { isValid: false, reason: "Loading authentication state..." }
      }

      // Check basic authentication
      if (!isAuthenticated || !user) {
        const reason = "Please log in to continue."
        if (showToasts) {
          toast({
            title: "Authentication Required",
            description: reason,
            variant: "destructive"
          })
        }
        return { isValid: false, reason }
      }

      // Validate session integrity
      const sessionValidation = await apiClient.validateSession()
      if (!sessionValidation.isValid) {
        const reason = sessionValidation.error || "Session expired. Please log in again."
        if (showToasts) {
          toast({
            title: "Session Invalid",
            description: reason,
            variant: "destructive"
          })
        }
        return { isValid: false, reason }
      }

      // Check seller role if required
      if (requireSeller && !isSeller) {
        const reason = "Please log in as a seller to publish a listing."
        if (showToasts) {
          toast({
            title: "Seller Access Required",
            description: reason,
            variant: "destructive"
          })
        }
        return { isValid: false, reason }
      }

      return { isValid: true, user: sessionValidation.user || user }

    } catch (error) {
      console.error("[useEnhancedAuth] Authentication check failed:", error)
      const reason = "Authentication check failed. Please try again."
      if (showToasts) {
        toast({
          title: "Authentication Error",
          description: reason,
          variant: "destructive"
        })
      }
      return { isValid: false, reason }
    }
  }, [isLoading, isAuthenticated, user, isSeller, requireSeller, showToasts])

  // Quick synchronous check (doesn't validate session with backend)
  const checkAuthenticationSync = useCallback((): {
    isValid: boolean
    reason?: string
  } => {
    if (isLoading) {
      return { isValid: false, reason: "Loading authentication state..." }
    }

    if (!isAuthenticated || !user) {
      const reason = "Please log in to continue."
      if (showToasts) {
        toast({
          title: "Authentication Required",
          description: reason,
          variant: "destructive"
        })
      }
      return { isValid: false, reason }
    }

    // Check userId validity
    const currentUserId = apiClient.getCurrentUserId()
    if (!currentUserId || currentUserId === "temp-id") {
      const reason = "Invalid session. Please log in again."
      if (showToasts) {
        toast({
          title: "Session Invalid",
          description: reason,
          variant: "destructive"
        })
      }
      return { isValid: false, reason }
    }

    if (requireSeller && !isSeller) {
      const reason = "Please log in as a seller to publish a listing."
      if (showToasts) {
        toast({
          title: "Seller Access Required",
          description: reason,
          variant: "destructive"
        })
      }
      return { isValid: false, reason }
    }

    return { isValid: true }
  }, [isLoading, isAuthenticated, user, isSeller, requireSeller, showToasts])

  // Handle authentication failure
  const handleAuthFailure = useCallback((reason: string) => {
    if (onAuthenticationFailed) {
      onAuthenticationFailed(reason)
    } else {
      router.push(redirectOnFail)
    }
  }, [onAuthenticationFailed, router, redirectOnFail])

  // Refresh session and handle errors gracefully
  const handleSessionRefresh = useCallback(async (): Promise<boolean> => {
    try {
      await refreshSession()
      if (onSessionRefreshed) {
        onSessionRefreshed()
      }
      return true
    } catch (error) {
      console.error("[useEnhancedAuth] Session refresh failed:", error)
      if (showToasts) {
        toast({
          title: "Session Refresh Failed",
          description: "Please log in again.",
          variant: "destructive"
        })
      }
      handleAuthFailure("Session refresh failed")
      return false
    }
  }, [refreshSession, onSessionRefreshed, showToasts, toast, handleAuthFailure])

  // Enhanced method for critical operations (photo upload, data fetching)
  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    const authCheck = await checkAuthenticationWithSession()
    
    if (!authCheck.isValid) {
      handleAuthFailure(authCheck.reason || "Authentication failed")
      return false
    }

    return true
  }, [checkAuthenticationWithSession, handleAuthFailure])

  // Page refresh handler - validates session on page load
  const handlePageRefresh = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false

    try {
      const authCheck = await checkAuthenticationWithSession()
      
      if (!authCheck.isValid) {
        console.log("[useEnhancedAuth] Page refresh - invalid session:", authCheck.reason)
        handleAuthFailure(authCheck.reason || "Session expired")
        return false
      }

      return true
    } catch (error) {
      console.error("[useEnhancedAuth] Page refresh validation failed:", error)
      handleAuthFailure("Session validation failed")
      return false
    }
  }, [isLoading, checkAuthenticationWithSession, handleAuthFailure])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isSeller,
    isAdmin: user?.role === "admin",
    isBuyer: user?.role === "buyer",

    // Enhanced validation methods
    checkAuthenticationWithSession,
    checkAuthenticationSync,
    ensureValidSession,
    handlePageRefresh,
    handleSessionRefresh,
    handleAuthFailure,

    // Utilities
    requireSeller,
    redirectOnFail
  }
}
