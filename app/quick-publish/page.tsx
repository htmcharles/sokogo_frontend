"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Car, CheckCircle, Upload, Camera } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function QuickPublishPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Simple form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")

  // Publishing state
  const [productId, setProductId] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Auto-setup API client when user is available
  useEffect(() => {
    if (user) {
      console.log("[QuickPublish] User available:", user.firstName, user.lastName, "Role:", user.role)
      apiClient.setUserId(user._id)
      console.log("[QuickPublish] API client userId set to:", user._id)
    }
  }, [user])

  // Simple redirect for non-authenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      console.log("[QuickPublish] Selected files:", files.length)
    }
  }

  const publishListing = async () => {
    // Basic validation
    if (!title || !description || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, description, and price.",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Please Login",
        description: "Please refresh the page and log in again.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsPublishing(true)
      
      console.log("[QuickPublish] Publishing listing for user:", user.firstName, user.lastName)
      console.log("[QuickPublish] User role:", user.role)
      console.log("[QuickPublish] API client userId:", apiClient.getCurrentUserId())
      
      // Ensure API client has the correct user ID
      apiClient.setUserId(user._id)
      
      // Create the listing
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: "RWF",
        category: "MOTORS",
        subcategory: "sedan",
        location: {
          district: "Kigali",
          city: "Kigali",
          address: "Kigali, Rwanda"
        },
        features: {
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          year: year ? parseInt(year) : undefined
        }
      }

      console.log("[QuickPublish] Creating listing with payload:", payload)
      
      const response = await apiClient.createItem(payload)
      const newProductId = response.item._id
      
      console.log("[QuickPublish] Listing created successfully! ID:", newProductId)
      setProductId(newProductId)
      setIsPublished(true)
      
      toast({
        title: "🎉 Listing Published!",
        description: "Your car listing is now live and visible to buyers!"
      })

      // Upload photos if any are selected
      if (selectedFiles.length > 0) {
        await uploadPhotos(newProductId)
      }

    } catch (error: any) {
      console.error("[QuickPublish] Failed to publish listing:", error)
      toast({
        title: "Publishing Failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const uploadPhotos = async (listingId: string) => {
    if (selectedFiles.length === 0) return

    try {
      setIsUploading(true)
      console.log("[QuickPublish] Uploading", selectedFiles.length, "photos for listing:", listingId)
      
      const result = await apiClient.uploadProductPhotos(listingId, selectedFiles)
      console.log("[QuickPublish] Photos uploaded successfully:", result)
      
      toast({
        title: "📸 Photos Uploaded!",
        description: `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} added to your listing.`
      })
      
    } catch (error: any) {
      console.error("[QuickPublish] Photo upload failed:", error)
      toast({
        title: "Photo Upload Failed",
        description: "Listing was created but photos couldn't be uploaded. You can add them later.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login required
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Car className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to publish your car listing.</p>
            <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quick Publish</h1>
          </div>
          <p className="text-gray-600">
            Hello {user.firstName}! Publish your car listing quickly and easily.
          </p>
        </div>

        {/* Success Message */}
        {isPublished && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Success!</h3>
              <p className="text-green-700 mb-4">Your car listing is now live!</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/seller")} variant="outline">
                  View My Listings
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
                  Publish Another Car
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Form */}
        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Fill in your car information and publish instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Car Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 2020 Toyota Camry"
                disabled={isPublished}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your car's condition, features, and any important details..."
                rows={3}
                disabled={isPublished}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 15000000"
                  disabled={isPublished}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2020"
                  disabled={isPublished}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g., Toyota"
                  disabled={isPublished}
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Camry"
                  disabled={isPublished}
                />
              </div>
            </div>

            {/* Photo Upload */}
            {!isPublished && (
              <div>
                <Label htmlFor="photos">Photos (Optional)</Label>
                <div className="mt-1">
                  <input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Publish Button */}
            <Button 
              onClick={publishListing}
              disabled={isPublishing || isPublished || isUploading}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : isUploading ? (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Uploading Photos...
                </>
              ) : isPublished ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Published Successfully!
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Publish My Car Listing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
