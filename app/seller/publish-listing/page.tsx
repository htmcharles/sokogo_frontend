"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Car, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function PublishListingPage() {
  const { user, isSeller, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Debug session state on component mount
  useEffect(() => {
    console.log("[PublishListing] Component mounted")
    console.log("[PublishListing] isLoading:", isLoading)
    console.log("[PublishListing] isAuthenticated:", isAuthenticated)
    console.log("[PublishListing] user:", user)
    console.log("[PublishListing] isSeller:", isSeller)
    console.log("[PublishListing] API client userId:", apiClient.getCurrentUserId())

    if (user && !isLoading) {
      // Ensure API client has the correct userId
      apiClient.setUserId(user._id)
      console.log("[PublishListing] Set API client userId to:", user._id)
    }
  }, [user, isAuthenticated, isLoading, isSeller])

  // Listing form state
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "RWF",
    category: "cars",
    subcategory: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    location: {
      district: "",
      city: "",
      address: ""
    }
  })

  // Upload and publishing state
  const [productId, setProductId] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isListingCreated, setIsListingCreated] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setListingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setListingData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const createListing = async () => {
    // Validate required fields first
    if (!listingData.title || !listingData.description || !listingData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (title, description, price).",
        variant: "destructive"
      })
      return
    }

    // Trust that user is already authenticated as seller (RoleProtectedRoute handles this)
    if (!user) {
      console.error("[PublishListing] No user found, but this should not happen inside RoleProtectedRoute")
      return
    }

    try {
      setIsPublishing(true)

      console.log("[PublishListing] Creating listing for seller:", user.firstName, user.lastName)
      console.log("[PublishListing] API client userId:", apiClient.getCurrentUserId())

      // Ensure API client has correct userId
      apiClient.setUserId(user._id)

      // Create the listing with correct format
      const payload = {
        title: listingData.title,
        description: listingData.description,
        price: parseFloat(listingData.price),
        currency: listingData.currency || "RWF",
        category: "MOTORS", // Use correct category expected by API
        subcategory: listingData.subcategory || "sedan",
        location: {
          district: listingData.location.district || "Kigali",
          city: listingData.location.city || "Kigali",
          address: listingData.location.address || "Kigali, Rwanda"
        },
        features: {
          make: listingData.make,
          model: listingData.model,
          year: listingData.year ? parseInt(listingData.year) : undefined,
          mileage: listingData.mileage ? parseInt(listingData.mileage) : undefined,
        }
      }

      console.log("[PublishListing] Creating item with payload:", payload)
      // If user already selected images (step 2), send them now via multipart
      const response = await apiClient.createItem({ ...(payload as any), imagesFiles: pendingFiles })
      const newProductId = response.item._id

      console.log("[PublishListing] Listing created with ID:", newProductId)
      setProductId(newProductId)
      setIsListingCreated(true)

      toast({
        title: "Listing Created!",
        description: "Your car listing has been created. Now you can upload photos."
      })

    } catch (error: any) {
      console.error("[PublishListing] Failed to create listing:", error)
      toast({
        title: "Failed to Create Listing",
        description: error?.message || "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePhotosUploaded = (imageUrls: string[]) => {
    setUploadedPhotos(prev => [...prev, ...imageUrls])
    toast({
      title: "Photos Added!",
      description: `${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''} uploaded successfully.`
    })
  }

  // Capture selected files before submit (CarPhotoUpload should call this via prop you add)
  const handleFilesSelected = (files: File[]) => {
    setPendingFiles(files)
  }

  const publishListing = async () => {
    if (!productId) {
      toast({
        title: "No Listing to Publish",
        description: "Please create a listing first.",
        variant: "destructive"
      })
      return
    }

    // Trust that user is already authenticated as seller (RoleProtectedRoute handles this)
    if (!user) {
      console.error("[PublishListing] No user found, but this should not happen inside RoleProtectedRoute")
      return
    }

    try {
      setIsPublishing(true)

      console.log("[PublishListing] Publishing listing:", productId)
      console.log("[PublishListing] User:", user.firstName, user.lastName)

      // Ensure API client has correct userId
      apiClient.setUserId(user._id)

      // Since the item is created, it's automatically "published"
      // The backend doesn't seem to have separate publish status
      console.log("[PublishListing] Listing is now published (created items are live by default)")

      toast({
        title: "Listing Published!",
        description: "Your car listing is now live and visible to buyers."
      })

      // Redirect to seller dashboard after a short delay
      setTimeout(() => {
        router.push("/seller")
      }, 1500)

    } catch (error: any) {
      console.error("[PublishListing] Failed to publish listing:", error)
      toast({
        title: "Failed to Publish",
        description: error?.message || "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <RoleProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Publish Car Listing</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create your car listing and upload photos. Only sellers can publish listings.
            </p>
          </div>

          {/* Seller Status */}
          {user && isSeller && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Seller Account Verified: {user.firstName} {user.lastName}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Session Info */}
          {process.env.NODE_ENV === "development" && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="text-sm space-y-1">
                  <div><strong>Auth Status:</strong> {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}</div>
                  <div><strong>Loading:</strong> {isLoading ? "⏳ Loading" : "✅ Ready"}</div>
                  <div><strong>User Role:</strong> {user?.role || "No role"}</div>
                  <div><strong>Is Seller:</strong> {isSeller ? "✅ Yes" : "❌ No"}</div>
                  <div><strong>User ID:</strong> <code className="bg-white px-1 rounded">{user?._id || "null"}</code></div>
                  <div><strong>API Client ID:</strong> <code className="bg-white px-1 rounded">{apiClient.getCurrentUserId() || "null"}</code></div>
                </div>
              </CardContent>
            </Card>
          )}



          <div className="space-y-6">
            {/* Step 1: Create Listing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  Car Details
                </CardTitle>
                <CardDescription>
                  Fill in the basic information about your car.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={listingData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., 2020 Toyota Camry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (RWF) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={listingData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="e.g., 15000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={listingData.make}
                      onChange={(e) => handleInputChange("make", e.target.value)}
                      placeholder="e.g., Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={listingData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                      placeholder="e.g., Camry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={listingData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={listingData.mileage}
                      onChange={(e) => handleInputChange("mileage", e.target.value)}
                      placeholder="e.g., 50000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={listingData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your car's condition, features, and any important details..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={createListing}
                  disabled={isPublishing || isListingCreated}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isPublishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Listing...
                    </>
                  ) : isListingCreated ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Listing Created
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    isListingCreated ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>2</div>
                  Upload Photos
                </CardTitle>
                <CardDescription>
                  Upload high-quality photos of your car. This step requires seller access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isListingCreated && productId ? (
                  <CarPhotoUpload
                    productId={productId}
                    onUploadSuccess={handlePhotosUploaded}
                    maxFiles={8}
                    onFilesSelected={handleFilesSelected as any}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Create your listing first to enable photo uploads.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Publish */}
            {isListingCreated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    Publish Listing
                  </CardTitle>
                  <CardDescription>
                    Review your listing and make it live for buyers to see.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Listing Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Title:</strong> {listingData.title}</p>
                      <p><strong>Price:</strong> {listingData.currency} {parseInt(listingData.price).toLocaleString()}</p>
                      <p><strong>Photos:</strong> {uploadedPhotos.length} uploaded</p>
                    </div>
                  </div>

                  <Button
                    onClick={publishListing}
                    disabled={isPublishing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isPublishing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      "Publish Listing"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  )
}
