"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { CarPhotoUpload } from "@/components/CarPhotoUpload"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Car, Upload as UploadIcon } from "lucide-react"

export default function UploadCarPhotoPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [productId, setProductId] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleUploadSuccess = (imageUrls: string[]) => {
    setUploadedImages(prev => [...prev, ...imageUrls])
    toast({
      title: "Photos uploaded successfully!",
      description: `${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''} uploaded and displayed below.`
    })
  }

  const handleUploadError = (error: string) => {
    toast({
      title: "Upload failed",
      description: error,
      variant: "destructive"
    })
  }

  const generateMockProductId = () => {
    const mockId = `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setProductId(mockId)
    toast({
      title: "Mock Product ID Generated",
      description: `Using product ID: ${mockId}`
    })
  }

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Upload Car Photos</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload high-quality photos of your car. Make sure you're logged in before uploading.
              Photos will be displayed immediately after successful upload.
            </p>
          </div>

          {/* User Welcome */}
          {user && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">
                    Welcome, {user.firstName} {user.lastName}!
                  </span>
                  <span className="text-green-600 text-sm">
                    ({user.role})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product ID Input (for demo purposes) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
              <CardDescription>
                Enter a product ID or generate a mock one for testing the upload functionality.
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
                    placeholder="Enter product ID or generate a mock one"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateMockProductId}
                    variant="outline"
                  >
                    Generate Mock ID
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload Component */}
          <CarPhotoUpload
            productId={productId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxFiles={8}
            className="mb-6"
          />

          {/* Display Uploaded Images */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon className="w-5 h-5 text-green-600" />
                  Uploaded Photos ({uploadedImages.length})
                </CardTitle>
                <CardDescription>
                  These photos have been successfully uploaded and are now available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((imageUrl, index) => (
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
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
