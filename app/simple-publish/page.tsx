"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { SimpleCarPhotoUpload } from "@/components/SimpleCarPhotoUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Car, CheckCircle, AlertCircle, User } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function SimplePublishPage() {
  const { user, isSeller, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Simple form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [productId, setProductId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  // Ensure API client is set up correctly
  useEffect(() => {
    if (user && !isLoading) {
      console.log("[SimplePublish] Setting up API client for user:", user.firstName, user.lastName)
      apiClient.setUserId(user._id)
    }
  }, [user, isLoading])

  // Simple redirect logic - don't be aggressive
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[SimplePublish] Not authenticated, redirecting to login")
      router.push("/login")
    }
    // Don't redirect sellers, just show a message if needed
  }, [isLoading, isAuthenticated, router])

  const createAndPublishListing = async () => {
    // Validate form
    if (!title || !description || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, description, and price.",
        variant: "destructive"
      })
      return
    }

    // Check authentication
    if (!user || !isSeller) {
      toast({
        title: "Authentication Required",
        description: "Please log in as a seller to publish a listing.",
        variant: "destructive"
      })
      router.push("/login")
      return
    }

    try {
      setIsCreating(true)
      
      console.log("[SimplePublish] Creating listing for seller:", user.firstName, user.lastName)
      
      // Ensure API client has correct userId
      apiClient.setUserId(user._id)
      
      // Create the listing with correct category format
      const payload = {
        title,
        description,
        price: parseFloat(price),
        currency: "RWF",
        category: "MOTORS", // Use the correct category expected by API
        subcategory: "sedan", // Default subcategory
        location: {
          district: "Kigali",
          city: "Kigali",
          address: "Kigali, Rwanda"
        }
      }

      console.log("[SimplePublish] Creating item with payload:", payload)
      const response = await apiClient.createItem(payload)
      const newProductId = response.item._id
      
      console.log("[SimplePublish] Listing created successfully with ID:", newProductId)
      setProductId(newProductId)
      setIsPublished(true)
      
      toast({
        title: "Listing Published!",
        description: "Your car listing has been created and is now live!"
      })

    } catch (error: any) {
      console.error("[SimplePublish] Failed to create listing:", error)
      toast({
        title: "Failed to Create Listing",
        description: error?.message || "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handlePhotosUploaded = (imageUrls: string[]) => {
    toast({
      title: "Photos Added!",
      description: `${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''} uploaded to your listing.`
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication required
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to publish a listing.</p>
            <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show seller role required
  if (!isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Seller Access Required</h2>
            <p className="text-gray-600 mb-2">Please log in as a seller to publish a listing.</p>
            <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
            <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700">
              Login as Seller
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Simple Publish Listing</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simplified listing creation without complex authentication checks.
          </p>
        </div>

        {/* User Status */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Logged in as: {user.firstName} {user.lastName} ({user.role})
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Simple Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Your Car Listing</CardTitle>
            <CardDescription>
              Fill in the basic details and publish your listing.
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
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your car's condition, features, and any important details..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price (RWF) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 15000000"
              />
            </div>

            <Button 
              onClick={createAndPublishListing}
              disabled={isCreating || isPublished}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating & Publishing...
                </>
              ) : isPublished ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Published Successfully!
                </>
              ) : (
                "Create & Publish Listing"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Photo Upload (only show after listing is created) */}
        {productId && (
          <Card>
            <CardHeader>
              <CardTitle>Add Photos to Your Listing</CardTitle>
              <CardDescription>
                Upload photos of your car to make your listing more attractive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleCarPhotoUpload
                productId={productId}
                onPhotosUploaded={handlePhotosUploaded}
              />
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {isPublished && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Listing Published Successfully!</h3>
              <p className="text-green-700 mb-4">Your car listing is now live and visible to buyers.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/seller")} variant="outline">
                  View My Listings
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
                  Create Another Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
