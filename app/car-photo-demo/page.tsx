"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { SimpleCarPhotoUpload } from "@/components/SimpleCarPhotoUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Car, LogOut, User } from "lucide-react"
import Link from "next/link"

export default function CarPhotoDemoPage() {
  const { user, isAuthenticated, isSeller, logout } = useAuth()
  const { toast } = useToast()
  const [productId, setProductId] = useState("")
  const [allUploadedPhotos, setAllUploadedPhotos] = useState<string[]>([])

  const handlePhotosUploaded = (newImageUrls: string[]) => {
    setAllUploadedPhotos(prev => [...prev, ...newImageUrls])
    toast({
      title: "Photos added to gallery!",
      description: `${newImageUrls.length} new photo${newImageUrls.length > 1 ? 's' : ''} added to your car gallery.`
    })
  }

  const generateSampleProductId = () => {
    const sampleId = `demo_car_${Date.now()}`
    setProductId(sampleId)
    toast({
      title: "Sample Product ID Generated",
      description: `Using: ${sampleId}`
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">Car Photo Upload Demo</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication-Protected Car Photo Upload</CardTitle>
              <CardDescription>
                This demo shows how the car photo upload component automatically checks user authentication
                and redirects to login if needed. Try uploading photos while logged in and logged out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="demo-product-id">Product ID (for demo)</Label>
                    <Input
                      id="demo-product-id"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="Enter a product ID or generate one"
                    />
                  </div>
                  <Button 
                    onClick={generateSampleProductId}
                    variant="outline"
                  >
                    Generate Sample ID
                  </Button>
                </div>
                
                {!isAuthenticated && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Not logged in:</strong> Try to upload a photo to see the authentication redirect in action.
                    </p>
                  </div>
                )}

                {isAuthenticated && user && !isSeller && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm">
                      <strong>Not a seller:</strong> You're logged in as a {user.role}. Try to upload a photo to see the seller role requirement message.
                    </p>
                  </div>
                )}

                {isAuthenticated && isSeller && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      <strong>Seller access confirmed:</strong> You can upload photos and publish listings.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload Component */}
          <SimpleCarPhotoUpload
            productId={productId}
            onPhotosUploaded={handlePhotosUploaded}
          />

          {/* All Uploaded Photos Gallery */}
          {allUploadedPhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Car Photo Gallery</CardTitle>
                <CardDescription>
                  All photos uploaded during this session are displayed here immediately after upload.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allUploadedPhotos.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Car photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <p><strong>Authentication Check:</strong> The component automatically checks if you're logged in when it loads.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <p><strong>Redirect if Not Logged In:</strong> If you're not authenticated, you'll be redirected to the login page.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <p><strong>Seller Role Check:</strong> Only users with 'seller' role can upload photos and publish listings.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <p><strong>File Validation:</strong> Only image files under 10MB are accepted.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</div>
                  <p><strong>Immediate Display:</strong> Successfully uploaded photos are displayed immediately on the page.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">6</div>
                  <p><strong>Error Handling:</strong> Clear error messages are shown for any upload failures.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
