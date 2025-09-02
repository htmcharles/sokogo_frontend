"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { apiClient, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isSeller: boolean
  isBuyer: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
    role: "buyer" | "seller" | "admin"
  }) => Promise<void>
  setUserAfterGoogleSignup: (userData: User) => void
  logout: () => void
  validateSession: () => Promise<boolean>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const hydratedFromNextAuthRef = useRef(false)

  // Enhanced session validation - memoized to prevent recreation
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const validation = await apiClient.validateSession()

      if (!validation.isValid) {
        console.warn("[AuthContext] Session validation failed:", validation.error)
        setUser(null)
        apiClient.logout()
        return false
      }

      if (validation.user) {
        setUser(validation.user)
        apiClient.setUserId(validation.user._id)
      }

      return true
    } catch (error) {
      console.error("[AuthContext] Session validation error:", error)
      setUser(null)
      apiClient.logout()
      return false
    }
  }, []) // No dependencies to prevent recreation

  // Refresh session from localStorage and validate - memoized
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      await validateSession()
    } finally {
      setIsLoading(false)
    }
  }, [validateSession])

  useEffect(() => {
    // Check if user is logged in on app start - simplified to prevent session clearing
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true)

        // If NextAuth already authenticated, perform real backend login using email+password
        if (!hydratedFromNextAuthRef.current && status === "authenticated" && session?.user?.email) {
          try {
            const profile = await apiClient.getUserProfile(session.user.email)
            // Some backends return hashed password and accept it for login; if not, backend must expose a Google-login endpoint
            if (profile && profile._id && profile.password) {
              const loginResp = await apiClient.login(session.user.email, profile.password)
              // Persist using official backend login response
              apiClient.setUserId(loginResp.user._id)
              if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(loginResp.user))
              }
              setUser(loginResp.user)
              hydratedFromNextAuthRef.current = true
              return
            }
          } catch (e) {
            // Fall through to localStorage path
          }
        }

        // First try to get user from localStorage
        const currentUser = apiClient.getCurrentUser()
        const currentUserId = apiClient.getCurrentUserId()

        if (!currentUser || !currentUserId || currentUserId === "temp-id") {
          console.log("[AuthContext] No valid session found in localStorage")
          setUser(null)
          apiClient.logout()
          return
        }

        // Set user from localStorage without aggressive backend validation
        console.log("[AuthContext] Restoring session from localStorage for user:", currentUser.firstName, currentUser.lastName)
        setUser(currentUser)
        apiClient.setUserId(currentUser._id)

        // Only validate session if explicitly needed (not on every app start)
        // This prevents clearing valid sessions due to backend issues

      } catch (error) {
        console.error("[AuthContext] Error checking auth status:", error)
        // Don't clear session on errors - might be temporary network issues
        const currentUser = apiClient.getCurrentUser()
        if (currentUser) {
          console.log("[AuthContext] Keeping session despite error, user exists in localStorage")
          setUser(currentUser)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, []) // Remove validateSession dependency to prevent loops

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      setUser(response.user)

      // Ensure the API client has the user ID set
      apiClient.setUserId(response.user._id)

      // Automatic role-based redirects
      if (typeof window !== "undefined") {
        if (response.user.role === "admin") {
          window.location.href = "/admin"
        } else if (response.user.role === "seller") {
          window.location.href = "/seller"
        } else {
          // Default redirect for buyers
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(async (userData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
  }) => {
    try {
      await apiClient.register({ ...userData, role: "seller" })
      // Note: After registration, user needs to login separately
      // This matches the backend API behavior
    } catch (error) {
      throw error
    }
  }, [])

  const setUserAfterGoogleSignup = useCallback((userData: User) => {
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    apiClient.logout()
    setUser(null)
    // Redirect to homepage after logout
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === "admin",
    isSeller: user?.role === "seller",
    isBuyer: user?.role === "buyer",
    login,
    register,
    setUserAfterGoogleSignup,
    logout,
    validateSession,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
