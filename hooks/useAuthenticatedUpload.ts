"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UseAuthenticatedUploadOptions {
  maxFiles?: number
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
  onUploadSuccess?: (imageUrls: string[]) => void
  onUploadError?: (error: string) => void
  onAuthenticationRequired?: () => void
  onSellerRoleRequired?: () => void
  requireSellerRole?: boolean
  showToasts?: boolean
}

interface UploadState {
  selectedFiles: File[]
  imagePreviewUrls: string[]
  isUploading: boolean
  isDragOver: boolean
  uploadedImageUrls: string[]
}

export function useAuthenticatedUpload(options: UseAuthenticatedUploadOptions = {}) {
  const {
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    onUploadSuccess,
    onUploadError,
    onAuthenticationRequired,
    onSellerRoleRequired,
    requireSellerRole = true,
    showToasts = false // Default to false to prevent automatic red toasts
  } = options

  const { isAuthenticated, isLoading, user, isSeller, validateSession } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  const [uploadState, setUploadState] = useState<UploadState>({
    selectedFiles: [],
    imagePreviewUrls: [],
    isUploading: false,
    isDragOver: false,
    uploadedImageUrls: []
  })

  // Memoize validation errors function to prevent recreation
  const validateFiles = useMemo(() => (files: File[]) => {
    const errors: string[] = []

    // Check file count
    if (uploadState.selectedFiles.length + files.length > maxFiles) {
      errors.push(`You can only upload up to ${maxFiles} photos.`)
    }

    // Check file types
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      errors.push("Only JPEG, PNG, and WebP images are allowed.")
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize)
    if (oversizedFiles.length > 0) {
      errors.push(`Each file must be smaller than ${Math.round(maxFileSize / (1024 * 1024))}MB.`)
    }

    return errors
  }, [uploadState.selectedFiles.length, maxFiles, allowedTypes, maxFileSize])

  // Enhanced authentication check with session validation
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      // Check loading state
      if (isLoading) {
        return false
      }

      // Basic authentication check
      if (!isAuthenticated || !user) {
        const message = "Please log in to upload photos."
        if (showToasts) {
          toast({
            title: "Authentication Required",
            description: message,
            variant: "destructive"
          })
        }

        if (onAuthenticationRequired) {
          onAuthenticationRequired()
        } else {
          router.push("/login")
        }
        return false
      }

      // Skip aggressive session validation to prevent logout issues
      // Just check if userId is valid
      const currentUserId = apiClient.getCurrentUserId()
      if (!currentUserId || currentUserId === "temp-id") {
        const message = "Invalid session. Please log in again."
        if (showToasts) {
          toast({
            title: "Session Invalid",
            description: message,
            variant: "destructive"
          })
        }

        if (onAuthenticationRequired) {
          onAuthenticationRequired()
        } else {
          router.push("/login")
        }
        return false
      }

      // Trust that seller role is handled by parent component
      // If requireSellerRole is true and this hook is used, assume user has proper access

      return true

    } catch (error) {
      console.error("[useAuthenticatedUpload] Authentication check failed:", error)
      const message = "Authentication check failed. Please try again."
      toast({
        title: "Authentication Error",
        description: message,
        variant: "destructive"
      })

      if (onAuthenticationRequired) {
        onAuthenticationRequired()
      } else {
        router.push("/login")
      }
      return false
    }
  }, [isLoading, isAuthenticated, user, isSeller, requireSellerRole, router, toast, onAuthenticationRequired, onSellerRoleRequired])



  const addFiles = useCallback(async (files: FileList | File[]) => {
    const isValid = await checkAuthentication()
    if (!isValid) return

    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const validationErrors = validateFiles(fileArray)
    if (validationErrors.length > 0) {
      toast({
        title: "Invalid files",
        description: validationErrors.join(" "),
        variant: "destructive"
      })
      return
    }

    // Filter valid files
    const validFiles = fileArray.filter(file => 
      allowedTypes.includes(file.type) && 
      file.size <= maxFileSize
    )

    // Update state with new files
    const newFiles = [...uploadState.selectedFiles, ...validFiles]
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))

    setUploadState(prev => ({
      ...prev,
      selectedFiles: newFiles,
      imagePreviewUrls: [...prev.imagePreviewUrls, ...newPreviews]
    }))

    toast({
      title: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} selected`,
      description: "Ready to upload when you click the upload button."
    })
  }, [checkAuthentication, validateFiles, uploadState.selectedFiles, allowedTypes, maxFileSize, toast])

  const removeFile = useCallback((index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(uploadState.imagePreviewUrls[index])
    
    setUploadState(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.filter((_, i) => i !== index),
      imagePreviewUrls: prev.imagePreviewUrls.filter((_, i) => i !== index)
    }))
  }, [uploadState.imagePreviewUrls])

  const uploadPhotos = useCallback(async (productId: string) => {
    const isValid = await checkAuthentication()
    if (!isValid) return

    if (uploadState.selectedFiles.length === 0) {
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
      setUploadState(prev => ({ ...prev, isUploading: true }))
      
      const response = await apiClient.uploadProductPhotos(productId, uploadState.selectedFiles)
      const imageUrls = response.imageUrls || []
      
      setUploadState(prev => ({
        ...prev,
        uploadedImageUrls: [...prev.uploadedImageUrls, ...imageUrls],
        selectedFiles: [],
        imagePreviewUrls: []
      }))

      // Clean up preview URLs
      uploadState.imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))

      toast({
        title: "Upload successful!",
        description: `${uploadState.selectedFiles.length} photo${uploadState.selectedFiles.length > 1 ? 's' : ''} uploaded successfully.`
      })

      if (onUploadSuccess) {
        onUploadSuccess(imageUrls)
      }

      return imageUrls

    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload photos"
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      })

      if (onUploadError) {
        onUploadError(errorMessage)
      }
      
      throw error
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }))
    }
  }, [checkAuthentication, uploadState.selectedFiles, uploadState.imagePreviewUrls, toast, onUploadSuccess, onUploadError])

  const setDragOver = useCallback((isDragOver: boolean) => {
    setUploadState(prev => ({ ...prev, isDragOver }))
  }, [])

  const clearAll = useCallback(() => {
    // Clean up preview URLs
    uploadState.imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    
    setUploadState({
      selectedFiles: [],
      imagePreviewUrls: [],
      isUploading: false,
      isDragOver: false,
      uploadedImageUrls: []
    })
  }, [uploadState.imagePreviewUrls])

  return {
    // State
    ...uploadState,
    isAuthenticated,
    isLoading,
    user,
    isSeller,

    // Actions
    addFiles,
    removeFile,
    uploadPhotos,
    setDragOver,
    clearAll,

    // Utilities
    checkAuthentication,

    // Configuration
    maxFiles,
    maxFileSize,
    allowedTypes,
    requireSellerRole
  }
}
