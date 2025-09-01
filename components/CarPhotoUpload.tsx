"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react"

interface CarPhotoUploadProps {
  productId?: string
  onUploadSuccess?: (imageUrls: string[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  className?: string
}

export const CarPhotoUpload = React.memo(function CarPhotoUpload({
  productId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
  className = ""
}: CarPhotoUploadProps) {
  const { isAuthenticated, isLoading, user, isSeller } = useAuth()
  const enhancedAuth = useEnhancedAuth({
    requireSeller: true,
    showToasts: false, // Disable automatic toasts to prevent red notifications
    onAuthenticationFailed: (reason) => {
      if (onUploadError) {
        onUploadError(reason)
      }
    }
  })
  const router = useRouter()
  const { toast } = useToast()

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isValidatingSession, setIsValidatingSession] = useState(false)

  // Simple authentication check on component mount - no aggressive validation
  useEffect(() => {
    // Just check basic auth state, don't validate session aggressively
    if (!isLoading && !isAuthenticated) {
      console.log("[CarPhotoUpload] User not authenticated")
    } else if (!isLoading && isAuthenticated && user) {
      console.log("[CarPhotoUpload] User authenticated:", user.firstName, user.lastName, user.role)
    }
  }, [isLoading, isAuthenticated, user])

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviewUrls])

  const processFiles = async (files: FileList | File[]) => {
    // Trust that user is already authenticated (parent component handles this)
    if (!user) {
      console.error("[CarPhotoUpload] No user found, but this should not happen")
      return
    }

    // Ensure API client has correct userId
    apiClient.setUserId(user._id)

    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // Check if adding these files would exceed the limit
    if (selectedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} photos.`,
        variant: "destructive"
      })
      return
    }

    // Validate file types
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    if (validFiles.length !== fileArray.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed.",
        variant: "destructive"
      })
    }

    // Validate file sizes (10MB max per file)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = validFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Each file must be smaller than 10MB.",
        variant: "destructive"
      })
      return
    }

    // Update state with new files
    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(prev => [...prev, ...newPreviews])

    toast({
      title: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} selected`,
      description: "Ready to upload when you click the upload button."
    })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await processFiles(event.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    await processFiles(files)
  }

  const removeImage = useCallback((index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }, [imagePreviewUrls])

  const uploadPhotos = useCallback(async () => {
    // Trust that user is already authenticated (parent component handles this)
    if (!user) {
      console.error("[CarPhotoUpload] No user found, but this should not happen")
      return
    }

    // Ensure API client has correct userId
    apiClient.setUserId(user._id)

    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo to upload.",
        variant: "destructive"
      })
      return
    }

    if (!productId) {
      toast({
        title: "Missing product ID",
        description: "Product ID is required for photo upload.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)
      const response = await apiClient.uploadProductPhotos(productId, selectedFiles)

      const imageUrls = response.imageUrls || []
      setUploadedImageUrls(prev => [...prev, ...imageUrls])

      toast({
        title: "Upload successful!",
        description: `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} uploaded successfully.`
      })

      // Clear selected files after successful upload
      setSelectedFiles([])
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
      setImagePreviewUrls([])

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(imageUrls)
      }

    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload photos"
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      })

      // Call error callback if provided
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setIsUploading(false)
    }
  }, [isAuthenticated, user, isSeller, selectedFiles, productId, imagePreviewUrls, toast, onUploadSuccess, onUploadError])

  // Show loading state while checking authentication or validating session
  if (isLoading || isValidatingSession) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">
              {isValidatingSession ? "Validating session..." : "Checking authentication..."}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Authentication Required</h3>
              <p className="text-gray-600 mt-1">You must be logged in to upload car photos.</p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="bg-red-600 hover:bg-red-700"
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Trust that authentication is handled by parent component
  // If this component is rendered, assume user has proper access

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Upload Car Photos
        </CardTitle>
        <CardDescription>
          Upload high-quality photos of your car. You can upload up to {maxFiles} images.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            id="car-photo-upload"
            disabled={isUploading}
          />
          <label 
            htmlFor="car-photo-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isDragOver 
                ? 'border-red-400 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-red-400'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 transition-colors duration-200 ${
                isDragOver ? 'text-red-500' : 'text-gray-400'
              }`} />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB each)</p>
            </div>
          </label>
        </div>

        {/* Selected Photos Preview */}
        {imagePreviewUrls.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Photos ({imagePreviewUrls.length}/{maxFiles})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div 
                  key={index}
                  className="relative group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <Button 
            onClick={uploadPhotos}
            disabled={isUploading || !productId}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''}...
              </>
            ) : (
              `Upload ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        )}

        {/* Uploaded Photos Display */}
        {uploadedImageUrls.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-700">
              Successfully Uploaded ({uploadedImageUrls.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImageUrls.map((url, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Info Display */}
        {isAuthenticated && user && (
          <div className="text-xs text-gray-500 border-t pt-3">
            Logged in as: {user.firstName} {user.lastName} ({user.role})
          </div>
        )}
      </CardContent>
    </Card>
  )
}
