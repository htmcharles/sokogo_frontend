"use client"

import React, { Suspense, lazy } from "react"
import { Card, CardContent } from "@/components/ui/card"

// Lazy load the heavy CarPhotoUpload component
const CarPhotoUpload = lazy(() => 
  import("./CarPhotoUpload").then(module => ({ default: module.CarPhotoUpload }))
)

// Loading fallback component
const UploadLoadingFallback = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Loading upload component...</span>
      </div>
    </CardContent>
  </Card>
)

interface LazyCarPhotoUploadProps {
  productId?: string
  onUploadSuccess?: (imageUrls: string[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  className?: string
}

export const LazyCarPhotoUpload = React.memo(function LazyCarPhotoUpload(props: LazyCarPhotoUploadProps) {
  return (
    <Suspense fallback={<UploadLoadingFallback />}>
      <CarPhotoUpload {...props} />
    </Suspense>
  )
})
