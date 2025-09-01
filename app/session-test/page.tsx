"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, RefreshCw, LogOut, CheckCircle, AlertCircle, Shield } from "lucide-react"

export default function SessionTestPage() {
  const { user, isAuthenticated, isLoading, isSeller, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sessionInfo, setSessionInfo] = useState<any>({})

  useEffect(() => {
    const updateSessionInfo = () => {
      if (typeof window === "undefined") return

      const info = {
        authContextUser: user,
        authContextAuthenticated: isAuthenticated,
        authContextLoading: isLoading,
        authContextSeller: isSeller,
        apiClientUserId: apiClient.getCurrentUserId(),
        apiClientAuthenticated: apiClient.isAuthenticated(),
        localStorageUserId: localStorage.getItem("userId"),
        localStorageUser: localStorage.getItem("user") ? "EXISTS" : "MISSING",
        timestamp: new Date().toLocaleTimeString()
      }
      
      setSessionInfo(info)
    }

    updateSessionInfo()
    
    // Update every 2 seconds to monitor session state
    const interval = setInterval(updateSessionInfo, 2000)
    return () => clearInterval(interval)
  }, [user, isAuthenticated, isLoading, isSeller])

  const refreshPage = () => {
    window.location.reload()
  }

  const navigateToSeller = () => {
    router.push("/seller")
  }

  const testApiCall = async () => {
    try {
      const response = await apiClient.getMyItems()
      toast({
        title: "API Call Successful",
        description: `Loaded ${response.items.length} items`
      })
    } catch (error: any) {
      toast({
        title: "API Call Failed",
        description: error.message || "Unknown error",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Session Persistence Test</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test page to verify that seller sessions persist correctly without red toast notifications.
          </p>
        </div>

        {/* Session Status */}
        <Card className={`mb-6 ${
          isAuthenticated && isSeller ? "border-green-200 bg-green-50" :
          isAuthenticated && !isSeller ? "border-yellow-200 bg-yellow-50" :
          "border-red-200 bg-red-50"
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAuthenticated && isSeller && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isAuthenticated && !isSeller && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              {!isAuthenticated && <AlertCircle className="w-5 h-5 text-red-600" />}
              Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "AUTHENTICATED" : "NOT AUTHENTICATED"}
                </Badge>
                <Badge variant={isSeller ? "default" : "secondary"}>
                  {isSeller ? "SELLER" : user?.role?.toUpperCase() || "NO ROLE"}
                </Badge>
                <Badge variant={isLoading ? "secondary" : "default"}>
                  {isLoading ? "LOADING" : "READY"}
                </Badge>
              </div>

              {user && (
                <div className="text-sm text-gray-700">
                  <strong>User:</strong> {user.firstName} {user.lastName} ({user.email})
                  <br />
                  <strong>Role:</strong> {user.role}
                  <br />
                  <strong>User ID:</strong> <code className="bg-gray-100 px-1 rounded">{user._id}</code>
                </div>
              )}

              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>API Client User ID:</strong> <code className="bg-gray-100 px-1 rounded">{sessionInfo.apiClientUserId || "null"}</code></div>
                <div><strong>API Client Authenticated:</strong> {sessionInfo.apiClientAuthenticated ? "Yes" : "No"}</div>
                <div><strong>localStorage User:</strong> {sessionInfo.localStorageUser}</div>
                <div><strong>Last Updated:</strong> {sessionInfo.timestamp}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Tests</CardTitle>
              <CardDescription>
                Test navigation to verify session persistence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={navigateToSeller}
                className="w-full"
                disabled={!isAuthenticated || !isSeller}
              >
                Go to Seller Dashboard
              </Button>
              <Button 
                onClick={refreshPage}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Go to Home Page
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Tests</CardTitle>
              <CardDescription>
                Test API calls to verify authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testApiCall}
                className="w-full"
                disabled={!isAuthenticated || !isSeller}
              >
                Test API Call (Get My Items)
              </Button>
              <Button 
                onClick={logout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1. Login as a seller</strong> - The session should persist</p>
              <p><strong>2. Refresh this page</strong> - You should stay logged in</p>
              <p><strong>3. Navigate to seller dashboard</strong> - Should work without red toasts</p>
              <p><strong>4. Come back to this page</strong> - Session should still be active</p>
              <p><strong>5. Test API calls</strong> - Should work without authentication errors</p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
