"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bug, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

export const SessionDebugger = React.memo(function SessionDebugger() {
  const { user, isAuthenticated, isLoading, isSeller, refreshSession } = useAuth()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [sessionData, setSessionData] = useState<any>({})
  const [lastCheck, setLastCheck] = useState<string>("")

  const refreshSessionData = () => {
    if (typeof window === "undefined") return

    const data = {
      // AuthContext state
      authContextUser: user,
      authContextAuthenticated: isAuthenticated,
      authContextLoading: isLoading,
      authContextSeller: isSeller,
      
      // API Client state
      apiClientUserId: apiClient.getCurrentUserId(),
      apiClientAuthenticated: apiClient.isAuthenticated(),
      
      // localStorage data
      localStorageUserId: localStorage.getItem("userId"),
      localStorageUser: localStorage.getItem("user"),
      
      // Parsed localStorage user
      parsedLocalUser: (() => {
        try {
          const userStr = localStorage.getItem("user")
          return userStr ? JSON.parse(userStr) : null
        } catch {
          return "PARSE_ERROR"
        }
      })(),
      
      // Session consistency check
      sessionConsistent: (() => {
        const localUserId = localStorage.getItem("userId")
        const apiUserId = apiClient.getCurrentUserId()
        const contextUserId = user?._id
        
        return localUserId === apiUserId && apiUserId === contextUserId
      })(),
      
      timestamp: new Date().toLocaleTimeString()
    }
    
    setSessionData(data)
    setLastCheck(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    if (isVisible) {
      refreshSessionData()
      // Auto-refresh every 2 seconds when visible
      const interval = setInterval(refreshSessionData, 2000)
      return () => clearInterval(interval)
    }
  }, [isVisible, user, isAuthenticated])

  const testSessionValidation = async () => {
    try {
      const validation = await apiClient.validateSession()
      toast({
        title: validation.isValid ? "Session Valid" : "Session Invalid",
        description: validation.error || "Session validation completed",
        variant: validation.isValid ? "default" : "destructive"
      })
      refreshSessionData()
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message || "Session validation failed",
        variant: "destructive"
      })
    }
  }

  const clearSession = () => {
    apiClient.logout()
    refreshSessionData()
    toast({
      title: "Session Cleared",
      description: "All session data has been cleared"
    })
  }

  const restoreSession = () => {
    const currentUser = apiClient.getCurrentUser()
    if (currentUser) {
      apiClient.setUserId(currentUser._id)
      refreshSessionData()
      toast({
        title: "Session Restored",
        description: "Session restored from localStorage"
      })
    } else {
      toast({
        title: "No Session to Restore",
        description: "No valid session found in localStorage",
        variant: "destructive"
      })
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Bug className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Session Debugger
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={sessionData.sessionConsistent ? "default" : "destructive"}>
                {sessionData.sessionConsistent ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {sessionData.sessionConsistent ? "CONSISTENT" : "INCONSISTENT"}
              </Badge>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3 text-xs">
          <div className="flex gap-2">
            <Button onClick={refreshSessionData} size="sm" variant="outline" className="text-xs h-6">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button onClick={testSessionValidation} size="sm" variant="outline" className="text-xs h-6">
              Test Validation
            </Button>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-700">Auth State:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>Authenticated: <Badge variant={sessionData.authContextAuthenticated ? "default" : "secondary"}>{sessionData.authContextAuthenticated ? "Yes" : "No"}</Badge></div>
              <div>Loading: <Badge variant={sessionData.authContextLoading ? "secondary" : "default"}>{sessionData.authContextLoading ? "Yes" : "No"}</Badge></div>
              <div>Is Seller: <Badge variant={sessionData.authContextSeller ? "default" : "secondary"}>{sessionData.authContextSeller ? "Yes" : "No"}</Badge></div>
              <div>API Auth: <Badge variant={sessionData.apiClientAuthenticated ? "default" : "secondary"}>{sessionData.apiClientAuthenticated ? "Yes" : "No"}</Badge></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-700">User Data:</div>
            <div className="text-xs space-y-1">
              <div>Context User: {sessionData.authContextUser ? `${sessionData.authContextUser.firstName} ${sessionData.authContextUser.lastName} (${sessionData.authContextUser.role})` : "None"}</div>
              <div>Local User: {sessionData.parsedLocalUser ? `${sessionData.parsedLocalUser.firstName} ${sessionData.parsedLocalUser.lastName}` : "None"}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-700">User IDs:</div>
            <div className="text-xs space-y-1">
              <div>Context: <code className="bg-gray-100 px-1 rounded">{sessionData.authContextUser?._id || "null"}</code></div>
              <div>API Client: <code className="bg-gray-100 px-1 rounded">{sessionData.apiClientUserId || "null"}</code></div>
              <div>localStorage: <code className="bg-gray-100 px-1 rounded">{sessionData.localStorageUserId || "null"}</code></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-700">Actions:</div>
            <div className="flex gap-1">
              <Button onClick={clearSession} size="sm" variant="destructive" className="text-xs h-6">
                Clear Session
              </Button>
              <Button onClick={restoreSession} size="sm" variant="outline" className="text-xs h-6">
                Restore Session
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-2">
            Last check: {lastCheck}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
