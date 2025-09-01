"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"
import { SimpleCarPhotoUpload } from "@/components/SimpleCarPhotoUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Car, Upload, CheckCircle, User } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function PublishCarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "excellent",
    fuelType: "petrol",
    transmission: "manual"
  })

  // Publishing state
  const [productId, setProductId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])

  // Ensure API client is set up correctly when user is available
  useEffect(() => {
    if (user) {
      console.log("[PublishCar] Setting up API client for seller:", user.firstName, user.lastName)
      apiClient.setUserId(user._id)
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const createAndPublishListing = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, description, and price.",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      console.error("[PublishCar] No user found")
      return
    }

    try {
      setIsCreating(true)
      
      console.log("[PublishCar] Creating listing for seller:", user.firstName, user.lastName)
      
      // Ensure API client has correct userId
      apiClient.setUserId(user._id)
      
      // Create the listing with correct format
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: "RWF",
        category: "MOTORS",
        subcategory: "sedan",
        location: {
          district: "Kigali",
          city: "Kigali",
          address: "Kigali, Rwanda"
        },
        features: {
          make: formData.make,
          model: formData.model,
          year: formData.year ? parseInt(formData.year) : undefined,
          mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
          fuelType: formData.fuelType,
          transmission: formData.transmission
        }
      }

      console.log("[PublishCar] Creating item with payload:", payload)
      const response = await apiClient.createItem(payload)
      const newProductId = response.item._id
      
      console.log("[PublishCar] Listing created successfully with ID:", newProductId)
      setProductId(newProductId)
      setIsPublished(true)
      
      toast({
        title: "Car Listing Published!",
        description: "Your car listing has been created and is now live! You can now add photos."
      })

    } catch (error: any) {
      console.error("[PublishCar] Failed to create listing:", error)
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
    setUploadedPhotos(prev => [...prev, ...imageUrls])
    toast({
      title: "Photos Added!",
      description: `${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''} uploaded to your listing.`
    })
  }

  return (
    <RoleProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Publish Your Car</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill in your car details, add photos, and publish your listing in one seamless flow.
            </p>
          </div>

          {/* User Status */}
          {user && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Publishing as: {user.firstName} {user.lastName} (Seller)
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Car Details Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Fill in your car information to create the listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Car Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., 2020 Toyota Camry"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price (RWF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="e.g., 15000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your car's condition, features, and any important details..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    placeholder="e.g., Toyota"
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="e.g., Camry"
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={createAndPublishListing}
                disabled={isCreating || isPublished}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
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
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Create & Publish Listing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Photo Upload (only show after listing is created) */}
          {productId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Photos to Your Listing</CardTitle>
                <CardDescription>
                  Upload photos of your car to make your listing more attractive to buyers.
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

          {/* Success Actions */}
          {isPublished && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Listing Published Successfully!</h3>
                <p className="text-green-700 mb-4">
                  Your car listing is now live and visible to buyers. 
                  {uploadedPhotos.length > 0 && ` You've uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''}.`}
                </p>
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
    </RoleProtectedRoute>
  )
}
