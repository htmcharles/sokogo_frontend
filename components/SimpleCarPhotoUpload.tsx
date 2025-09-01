"use client"

import React, { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuthenticatedUpload } from "@/hooks/useAuthenticatedUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, AlertCircle, ImageIcon } from "lucide-react"

interface SimpleCarPhotoUploadProps {
  productId: string
  onPhotosUploaded?: (imageUrls: string[]) => void
  className?: string
}

export const SimpleCarPhotoUpload = React.memo(function SimpleCarPhotoUpload({
  productId,
  onPhotosUploaded,
  className = ""
}: SimpleCarPhotoUploadProps) {
  const router = useRouter()
  
  // Memoize upload options to prevent hook recreation
  const uploadOptions = useMemo(() => ({
    maxFiles: 8,
    requireSellerRole: true,
    showToasts: false, // Disable automatic toasts
    onUploadSuccess: (imageUrls: string[]) => {
      if (onPhotosUploaded) {
        onPhotosUploaded(imageUrls)
      }
    },
    onAuthenticationRequired: () => {
      router.push("/login")
    },
    onSellerRoleRequired: () => {
      // Could redirect to a role selection page or show a message
    }
  }), [onPhotosUploaded, router])

  const {
    selectedFiles,
    imagePreviewUrls,
    isUploading,
    isDragOver,
    uploadedImageUrls,
    isAuthenticated,
    isLoading,
    user,
    isSeller,
    addFiles,
    removeFile,
    uploadPhotos,
    setDragOver,
    checkAuthentication
  } = useAuthenticatedUpload(uploadOptions)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await addFiles(event.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    await addFiles(e.dataTransfer.files)
  }

  const handleUpload = useCallback(async () => {
    // Trust that user is already authenticated (parent component handles this)
    if (!user) {
      console.error("[SimpleCarPhotoUpload] No user found, but this should not happen")
      return
    }

    // Ensure API client has correct userId
    apiClient.setUserId(user._id)

    await uploadPhotos(productId)
  }, [user, uploadPhotos, productId])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Checking authentication...</span>
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
              <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
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
    <div className={className}>
      {/* User Status */}
      {user && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Logged in as {user.firstName} {user.lastName}</span>
            <span className="text-green-600 text-sm">({user.role})</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Upload Car Photos
          </CardTitle>
          <CardDescription>
            Select and upload photos of your car. All photos will be displayed immediately after upload.
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
              id="simple-car-photo-upload"
              disabled={isUploading}
            />
            <label 
              htmlFor="simple-car-photo-upload"
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
                Selected Photos ({imagePreviewUrls.length})
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
                      onClick={() => removeFile(index)}
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
              onClick={handleUpload}
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
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium text-green-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
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
        </CardContent>
      </Card>
    </div>
  )
}
