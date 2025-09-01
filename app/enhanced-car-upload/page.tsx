"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth"
import { CarPhotoUpload } from "@/components/CarPhotoUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Car, Shield, AlertCircle, CheckCircle, RefreshCw, User } from "lucide-react"

export default function EnhancedCarUploadPage() {
  const { user, isAuthenticated, isSeller, logout } = useAuth()
  const enhancedAuth = useEnhancedAuth({
    requireSeller: true,
    showToasts: false, // Disable automatic toasts
    onAuthenticationFailed: (reason) => {
      setAuthError(reason)
    },
    onSessionRefreshed: () => {
      setAuthError(null)
    }
  })
  const router = useRouter()
  const { toast } = useToast()

  const [productId, setProductId] = useState("")
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [authError, setAuthError] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<"checking" | "valid" | "invalid">("checking")

  // Simple session status check based on auth context
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user && isSeller) {
        setSessionStatus("valid")
        setAuthError(null)
      } else if (isAuthenticated && user && !isSeller) {
        setSessionStatus("invalid")
        setAuthError("Please log in as a seller to publish a listing.")
      } else if (!isAuthenticated) {
        setSessionStatus("invalid")
        setAuthError("Please log in to continue.")
      }
    }
  }, [isLoading, isAuthenticated, user, isSeller])

  const handlePhotosUploaded = useCallback((imageUrls: string[]) => {
    setUploadedPhotos(prev => [...prev, ...imageUrls])
    toast({
      title: "Photos Uploaded Successfully!",
      description: `${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''} uploaded and displayed below.`
    })
  }, [toast])

  const handleUploadError = useCallback((error: string) => {
    setAuthError(error)
  }, [])

  const generateProductId = useCallback(() => {
    const id = `enhanced_car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setProductId(id)
    toast({
      title: "Product ID Generated",
      description: `Using: ${id}`
    })
  }, [toast])

  const refreshSession = async () => {
    setAuthError(null)
    const success = await enhancedAuth.handleSessionRefresh()
    if (success) {
      setSessionStatus("valid")
    } else {
      setSessionStatus("invalid")
    }
  }

  const validateCurrentSession = async () => {
    setSessionStatus("checking")
    const authCheck = await enhancedAuth.checkAuthenticationWithSession()
    setSessionStatus(authCheck.isValid ? "valid" : "invalid")
    if (!authCheck.isValid) {
      setAuthError(authCheck.reason || "Session validation failed")
    } else {
      setAuthError(null)
      toast({
        title: "Session Valid",
        description: "Your session is active and valid."
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Car Photo Upload</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Robust authentication with session validation, seller role checking, and graceful error handling.
          </p>
        </div>

        {/* Session Status Card */}
        <Card className={`mb-6 ${
          sessionStatus === "valid" ? "border-green-200 bg-green-50" :
          sessionStatus === "invalid" ? "border-red-200 bg-red-50" :
          "border-yellow-200 bg-yellow-50"
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sessionStatus === "checking" && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-yellow-800 font-medium">Validating Session...</span>
                  </>
                )}
                {sessionStatus === "valid" && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Session Valid</span>
                    {user && (
                      <span className="text-green-600 text-sm">
                        - {user.firstName} {user.lastName} ({user.role})
                      </span>
                    )}
                  </>
                )}
                {sessionStatus === "invalid" && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">Session Invalid</span>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={validateCurrentSession}
                  variant="outline"
                  size="sm"
                  disabled={sessionStatus === "checking"}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Check Session
                </Button>
                {sessionStatus === "invalid" && (
                  <Button 
                    onClick={refreshSession}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            {authError && (
              <p className="text-red-700 text-sm mt-2">{authError}</p>
            )}
          </CardContent>
        </Card>

        {/* Product ID Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Setup</CardTitle>
            <CardDescription>
              Generate a product ID to test the enhanced upload functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter product ID or generate one"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={generateProductId} variant="outline">
                  Generate ID
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Photo Upload */}
        <CarPhotoUpload
          productId={productId}
          onUploadSuccess={handlePhotosUploaded}
          onUploadError={handleUploadError}
          maxFiles={8}
          className="mb-6"
        />

        {/* Uploaded Photos Gallery */}
        {uploadedPhotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Successfully Uploaded Photos ({uploadedPhotos.length})
              </CardTitle>
              <CardDescription>
                These photos were uploaded with enhanced authentication validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Uploaded car photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Authentication Features Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enhanced Authentication Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Session Validation:</strong> Validates session integrity before any upload operation</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Page Refresh Handling:</strong> Re-validates authentication when page is refreshed</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Seller Role Enforcement:</strong> Shows "Please log in as a seller to publish a listing" for non-sellers</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Temp-ID Protection:</strong> Detects and handles invalid temporary user IDs</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Graceful Error Handling:</strong> Clear error messages instead of crashes</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p><strong>Session Recovery:</strong> Attempts to refresh session from localStorage when possible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
