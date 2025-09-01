"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, User, RefreshCw, CheckCircle, AlertCircle, LogOut } from "lucide-react"

export default function AuthDebugPage() {
  const { user, isAuthenticated, isLoading, isSeller, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const updateDebugInfo = () => {
      if (typeof window === "undefined") return

      const info = {
        // Auth Context
        contextUser: user,
        contextAuthenticated: isAuthenticated,
        contextLoading: isLoading,
        contextSeller: isSeller,
        
        // API Client
        apiUserId: apiClient.getCurrentUserId(),
        apiAuthenticated: apiClient.isAuthenticated(),
        
        // localStorage
        localUserId: localStorage.getItem("userId"),
        localUser: (() => {
          try {
            const userStr = localStorage.getItem("user")
            return userStr ? JSON.parse(userStr) : null
          } catch {
            return "PARSE_ERROR"
          }
        })(),
        
        // Consistency
        idsMatch: (() => {
          const localId = localStorage.getItem("userId")
          const apiId = apiClient.getCurrentUserId()
          const contextId = user?._id
          return localId === apiId && apiId === contextId
        })(),
        
        timestamp: new Date().toLocaleTimeString()
      }
      
      setDebugInfo(info)
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 1000)
    return () => clearInterval(interval)
  }, [user, isAuthenticated, isLoading, isSeller])

  const testCreateItem = async () => {
    if (!user || !isSeller) {
      toast({
        title: "Authentication Required",
        description: "Please log in as a seller first.",
        variant: "destructive"
      })
      return
    }

    try {
      // Ensure API client has correct userId
      apiClient.setUserId(user._id)
      
      const testPayload = {
        title: "Test Car Listing",
        description: "This is a test car listing to verify the API works",
        price: 1000000,
        currency: "RWF",
        category: "MOTORS",
        subcategory: "sedan",
        location: {
          district: "Kigali",
          city: "Kigali",
          address: "Kigali, Rwanda"
        }
      }

      console.log("[AuthDebug] Creating test item with payload:", testPayload)
      const response = await apiClient.createItem(testPayload)
      
      toast({
        title: "Success!",
        description: `Test listing created with ID: ${response.item._id}`
      })
      
      console.log("[AuthDebug] Test item created successfully:", response)
      
    } catch (error: any) {
      console.error("[AuthDebug] Failed to create test item:", error)
      toast({
        title: "API Test Failed",
        description: error?.message || "Unknown error",
        variant: "destructive"
      })
    }
  }

  const fixApiClientUserId = () => {
    if (user) {
      apiClient.setUserId(user._id)
      toast({
        title: "API Client Fixed",
        description: "Set API client userId to match current user"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Authentication Debug</h1>
          </div>
          <p className="text-gray-600">Debug authentication issues and test API calls</p>
        </div>

        {/* Current Status */}
        <Card className={`mb-6 ${
          isAuthenticated && isSeller ? "border-green-200 bg-green-50" :
          isAuthenticated ? "border-yellow-200 bg-yellow-50" :
          "border-red-200 bg-red-50"
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAuthenticated && isSeller ? <CheckCircle className="w-5 h-5 text-green-600" /> :
               isAuthenticated ? <AlertCircle className="w-5 h-5 text-yellow-600" /> :
               <AlertCircle className="w-5 h-5 text-red-600" />}
              Current Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "AUTHENTICATED" : "NOT AUTH"}
              </Badge>
              <Badge variant={isSeller ? "default" : "secondary"}>
                {isSeller ? "SELLER" : user?.role?.toUpperCase() || "NO ROLE"}
              </Badge>
              <Badge variant={isLoading ? "secondary" : "default"}>
                {isLoading ? "LOADING" : "READY"}
              </Badge>
              <Badge variant={debugInfo.idsMatch ? "default" : "destructive"}>
                {debugInfo.idsMatch ? "IDS MATCH" : "ID MISMATCH"}
              </Badge>
            </div>

            {user && (
              <div className="text-sm space-y-1">
                <div><strong>User:</strong> {user.firstName} {user.lastName} ({user.email})</div>
                <div><strong>Role:</strong> {user.role}</div>
                <div><strong>User ID:</strong> <code className="bg-gray-100 px-1 rounded">{user._id}</code></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Auth Context:</h4>
                <div className="space-y-1 text-xs">
                  <div>User: {debugInfo.contextUser ? `${debugInfo.contextUser.firstName} ${debugInfo.contextUser.lastName}` : "null"}</div>
                  <div>Authenticated: {debugInfo.contextAuthenticated ? "Yes" : "No"}</div>
                  <div>Loading: {debugInfo.contextLoading ? "Yes" : "No"}</div>
                  <div>Is Seller: {debugInfo.contextSeller ? "Yes" : "No"}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">API Client:</h4>
                <div className="space-y-1 text-xs">
                  <div>User ID: <code className="bg-gray-100 px-1 rounded">{debugInfo.apiUserId || "null"}</code></div>
                  <div>Authenticated: {debugInfo.apiAuthenticated ? "Yes" : "No"}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">localStorage:</h4>
                <div className="space-y-1 text-xs">
                  <div>User ID: <code className="bg-gray-100 px-1 rounded">{debugInfo.localUserId || "null"}</code></div>
                  <div>User Data: {debugInfo.localUser ? "EXISTS" : "MISSING"}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Status:</h4>
                <div className="space-y-1 text-xs">
                  <div>IDs Match: {debugInfo.idsMatch ? "✅ Yes" : "❌ No"}</div>
                  <div>Last Update: {debugInfo.timestamp}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={fixApiClientUserId}
                variant="outline"
                className="w-full"
                disabled={!user}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Fix API Client User ID
              </Button>
              
              <Button 
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full"
              >
                Go to Login
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

          <Card>
            <CardHeader>
              <CardTitle>API Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testCreateItem}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={!isAuthenticated || !isSeller}
              >
                Test Create Listing
              </Button>
              
              <Button 
                onClick={() => router.push("/simple-publish")}
                variant="outline"
                className="w-full"
                disabled={!isAuthenticated || !isSeller}
              >
                Go to Simple Publish
              </Button>
              
              <Button 
                onClick={() => router.push("/seller/publish-listing")}
                variant="outline"
                className="w-full"
                disabled={!isAuthenticated || !isSeller}
              >
                Go to Full Publish Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1. Check Authentication:</strong> Make sure you're logged in and the status shows "AUTHENTICATED"</p>
              <p><strong>2. Verify Seller Role:</strong> Status should show "SELLER" not "BUYER" or other roles</p>
              <p><strong>3. Check ID Consistency:</strong> All user IDs should match (context, API client, localStorage)</p>
              <p><strong>4. Fix API Client:</strong> Click "Fix API Client User ID" if IDs don't match</p>
              <p><strong>5. Test API:</strong> Click "Test Create Listing" to verify the API works</p>
              <p><strong>6. Use Simple Publish:</strong> Try the simplified publish page if the full one has issues</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
