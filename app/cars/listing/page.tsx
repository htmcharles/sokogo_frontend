"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, ChevronRight, Home, ArrowLeft, Loader2, X, Upload } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

function FinalListingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [previousData, setPreviousData] = useState<any>(null)
  const [formData, setFormData] = useState({
    fuelType: "",
    seatingCapacity: "",
    exteriorColor: "",
    horsePower: "",
    interiorColor: "",
    warranty: "",
    doors: "",
    transmissionType: "",
    steeringSide: "",
    title: "",
    description: "",
  })

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const [technicalFeatures, setTechnicalFeatures] = useState({
    tiptronicGears: false,
    frontWheelDrive: false,
    n2oSystem: false,
    rearWheelDrive: false,
    frontAirbags: false,
    fourWheelDrive: false,
    sideAirbags: false,
    allWheelSteering: false,
    powerSteering: false,
    allWheelDrive: false,
    cruiseControl: false,
    antiLockBrakes: false,
  })

  useEffect(() => {
    const savedData = sessionStorage.getItem("carDetailsForm")
    if (savedData) {
      setPreviousData(JSON.parse(savedData))
    }
  }, [])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviewUrls])

  const parsePrice = (priceBucket: string): number => {
    switch (priceBucket) {
      case "under-5m":
        return 4000000
      case "5m-10m":
        return 7500000
      case "10m-20m":
        return 15000000
      case "20m+":
        return 20000000
      default:
        return 0
    }
  }

  const parseKilometers = (range: string): number | undefined => {
    switch (range) {
      case "0-10000":
        return 5000
      case "10000-50000":
        return 30000
      case "50000-100000":
        return 75000
      case "100000+":
        return 120000
      default:
        return undefined
    }
  }

  const normalizeYesNo = (value: string): string | undefined => {
    if (!value) return undefined
    if (value === "valid") return "yes"
    if (value === "expired") return "no"
    return value
  }

  const toNumber = (val: string): number | undefined => {
    if (!val) return undefined
    const cleaned = val.replace(/[^0-9]/g, "")
    return cleaned ? parseInt(cleaned) : undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiClient.isAuthenticated()) {
      alert("Please log in as a seller to publish a listing.")
      router.push("/login")
      return
    }

    const [make, model] = (previousData?.makeModel || "").split("-")

    // Upload images locally first and collect public paths
    let localImagePaths: string[] = []
    if (selectedFiles.length > 0) {
      try {
        setIsUploading(true)
        const resp = await apiClient.uploadImagesLocally(selectedFiles)
        localImagePaths = resp.imagePaths || []
      } catch (uploadErr: any) {
        toast({ title: "Local upload failed", description: uploadErr?.message || "Proceeding without images." })
      } finally {
        setIsUploading(false)
      }
    }

    const payload = {
      title: formData.title || `${make ? make.toUpperCase() : "Car"} ${model ? model.toUpperCase() : "Listing"}`,
      description: formData.description || "",
      price: parsePrice(previousData?.price || ""),
      currency: "RWF",
      category: "MOTORS" as const,
      subcategory: "CARS",
      images: localImagePaths,
      location: {
        district: previousData?.location || "",
        city: previousData?.location ? "Kigali" : "",
        address: "",
      },
      features: {
        make: make ? make.charAt(0).toUpperCase() + make.slice(1) : undefined,
        model: model ? model.toUpperCase() : undefined,
        year: previousData?.year ? parseInt(previousData.year) : undefined,
        kilometers: parseKilometers(previousData?.kilometers || ""),
        bodyType: previousData?.bodyType ? previousData.bodyType.toUpperCase() : undefined,
        isInsuredInRwanda: previousData?.insured || undefined,
        technicalControl: normalizeYesNo(previousData?.technicalControl || ""),
        exteriorColor: formData.exteriorColor ? formData.exteriorColor.charAt(0).toUpperCase() + formData.exteriorColor.slice(1) : undefined,
        interiorColor: formData.interiorColor ? formData.interiorColor.charAt(0).toUpperCase() + formData.interiorColor.slice(1) : undefined,
        warranty: formData.warranty || undefined,
        doors: toNumber(formData.doors),
        transmissionType: formData.transmissionType ? formData.transmissionType.charAt(0).toUpperCase() + formData.transmissionType.slice(1) : undefined,
        steeringSide: formData.steeringSide ? (formData.steeringSide === "left" ? "Left" : "Right") : undefined,
        fuelType: formData.fuelType ? formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1) : undefined,
        seatingCapacity: toNumber(formData.seatingCapacity),
        horsePower: toNumber(formData.horsePower),
        frontAirbags: technicalFeatures.frontAirbags || undefined,
        sideAirbags: technicalFeatures.sideAirbags || undefined,
        powerSteering: technicalFeatures.powerSteering || undefined,
        cruiseControl: technicalFeatures.cruiseControl || undefined,
        frontWheelDrive: technicalFeatures.frontWheelDrive || undefined,
        antiLockBrakesABS: technicalFeatures.antiLockBrakes || undefined,
      },
    }

    try {
      // Create item using local image paths in payload
      const res = await apiClient.createItem(payload as any)
      const itemId = res.item._id

      toast({
        title: "Success!",
        description: "Your listing has been published successfully."
      })

      sessionStorage.removeItem("carDetailsForm")
      router.push("/seller")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to publish listing"
      })
    }
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    // Validate file types
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    if (validFiles.length !== fileArray.length) {
      toast({ title: "Invalid files", description: "Only image files are allowed." })
    }

    // Update state with new files
    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(prev => [...prev, ...newPreviews])

    // Show feedback
    toast({
      title: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} selected`,
      description: "Images will be uploaded when you publish your listing."
    })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files || [])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    processFiles(files)
  }

  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (productId: string) => {
    if (selectedFiles.length === 0) return

    try {
      setIsUploading(true)
      const res = await apiClient.uploadProductPhotos(productId, selectedFiles)
      toast({
        title: "Upload complete",
        description: `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} uploaded successfully`
      })
      return res.imageUrls || []
    } catch (error: any) {
      toast({ title: "Upload failed", description: error?.message || "Please try again" })
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setTechnicalFeatures((prev) => ({ ...prev, [feature]: checked }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Link href="/">
          <h1 className="text-4xl font-bold text-gray-800 cursor-pointer">
            SOKO<span className="text-red-600">GO</span>
          </h1>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">You're almost there!</h2>
        <p className="text-gray-600">Include as much details and pictures as possible, and set the right price!</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-red-600">
          <Home className="w-4 h-4" />
          <span className="font-medium">MOTORS</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium">CARS</span>
        </div>
        <Link href="/cars">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <span className="font-semibold">LISTING SUMMARY</span>
              <Link href="/cars">
                <Button variant="link" className="text-red-600 p-0 h-auto font-normal">
                  EDIT
                </Button>
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">MAKE & MODEL</span>
                {previousData?.makeModel && (
                  <div className="text-gray-600 capitalize">{previousData.makeModel.replace("-", " ")}</div>
                )}
              </div>
              <div>
                <span className="font-medium">YEAR</span>
                {previousData?.year && <div className="text-gray-600">{previousData.year}</div>}
              </div>
              <div>
                <span className="font-medium">KILOMETERS</span>
                {previousData?.kilometers && <div className="text-gray-600">{previousData.kilometers}</div>}
              </div>
              <div>
                <span className="font-medium">BODY TYPE</span>
                {previousData?.bodyType && <div className="text-gray-600 capitalize">{previousData.bodyType}</div>}
              </div>
              <div>
                <span className="font-medium">PRICE</span>
                {previousData?.price && <div className="text-gray-600">{previousData.price}</div>}
              </div>
              <div>
                <span className="font-medium">PHONE NUMBER</span>
                {previousData?.phoneNumber && <div className="text-gray-600">{previousData.phoneNumber}</div>}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Product Photos</label>

              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-red-400'
                  }`}
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

              {/* Photo Preview Grid */}
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

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Image Index */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Status */}
              {isUploading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    Uploading {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''}...
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">TITLE*</label>
                <Input
                  placeholder="ENTER A DESCRIPTIVE TITLE OF YOUR AD"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">DESCRIBE YOUR CAR*</label>
                <Textarea
                  placeholder="TELL US ABOUT THE CHARACTERISTICS OF YOUR CAR, HOW LONG HAVE YOU OWNED IT, DOES IT HAVE ANY BUMPS, SCRATCHES?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-24 text-sm"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="FUEL TYPE*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.seatingCapacity}
                onValueChange={(value) => setFormData({ ...formData, seatingCapacity: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="SEATING CAPACITY*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Seats</SelectItem>
                  <SelectItem value="4">4 Seats</SelectItem>
                  <SelectItem value="5">5 Seats</SelectItem>
                  <SelectItem value="7">7 Seats</SelectItem>
                  <SelectItem value="8+">8+ Seats</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.exteriorColor}
                onValueChange={(value) => setFormData({ ...formData, exteriorColor: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="EXTERIOR COLOR*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.horsePower}
                onValueChange={(value) => setFormData({ ...formData, horsePower: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="HORSE POWER*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-100">Under 100 HP</SelectItem>
                  <SelectItem value="100-200">100-200 HP</SelectItem>
                  <SelectItem value="200-300">200-300 HP</SelectItem>
                  <SelectItem value="300+">300+ HP</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.interiorColor}
                onValueChange={(value) => setFormData({ ...formData, interiorColor: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="INTERIOR COLOR*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="beige">Beige</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.warranty}
                onValueChange={(value) => setFormData({ ...formData, warranty: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="WARRANTY*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formData.doors} onValueChange={(value) => setFormData({ ...formData, doors: value })}>
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="DOORS*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Doors</SelectItem>
                  <SelectItem value="4">4 Doors</SelectItem>
                  <SelectItem value="5">5 Doors</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.transmissionType}
                onValueChange={(value) => setFormData({ ...formData, transmissionType: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="TRANSMISSION TYPE*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="cvt">CVT</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.steeringSide}
                onValueChange={(value) => setFormData({ ...formData, steeringSide: value })}
              >
                <SelectTrigger className="h-12 rounded-full">
                  <SelectValue placeholder="STEERING SIDE*" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Hand Drive</SelectItem>
                  <SelectItem value="right">Right Hand Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">TECHNICAL FEATURES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tiptronic"
                      checked={technicalFeatures.tiptronicGears}
                      onCheckedChange={(checked) => handleFeatureChange("tiptronicGears", checked as boolean)}
                    />
                    <label htmlFor="tiptronic" className="text-sm">
                      Tiptronic Gears
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="n2o"
                      checked={technicalFeatures.n2oSystem}
                      onCheckedChange={(checked) => handleFeatureChange("n2oSystem", checked as boolean)}
                    />
                    <label htmlFor="n2o" className="text-sm">
                      N2O System
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="frontAirbags"
                      checked={technicalFeatures.frontAirbags}
                      onCheckedChange={(checked) => handleFeatureChange("frontAirbags", checked as boolean)}
                    />
                    <label htmlFor="frontAirbags" className="text-sm">
                      Front Airbags
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sideAirbags"
                      checked={technicalFeatures.sideAirbags}
                      onCheckedChange={(checked) => handleFeatureChange("sideAirbags", checked as boolean)}
                    />
                    <label htmlFor="sideAirbags" className="text-sm">
                      Side Airbags
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="powerSteering"
                      checked={technicalFeatures.powerSteering}
                      onCheckedChange={(checked) => handleFeatureChange("powerSteering", checked as boolean)}
                    />
                    <label htmlFor="powerSteering" className="text-sm">
                      Power Steering
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cruiseControl"
                      checked={technicalFeatures.cruiseControl}
                      onCheckedChange={(checked) => handleFeatureChange("cruiseControl", checked as boolean)}
                    />
                    <label htmlFor="cruiseControl" className="text-sm">
                      Cruise Control
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="frontWheelDrive"
                      checked={technicalFeatures.frontWheelDrive}
                      onCheckedChange={(checked) => handleFeatureChange("frontWheelDrive", checked as boolean)}
                    />
                    <label htmlFor="frontWheelDrive" className="text-sm">
                      Front Wheel Drive
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rearWheelDrive"
                      checked={technicalFeatures.rearWheelDrive}
                      onCheckedChange={(checked) => handleFeatureChange("rearWheelDrive", checked as boolean)}
                    />
                    <label htmlFor="rearWheelDrive" className="text-sm">
                      Rear Wheel Drive
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fourWheelDrive"
                      checked={technicalFeatures.fourWheelDrive}
                      onCheckedChange={(checked) => handleFeatureChange("fourWheelDrive", checked as boolean)}
                    />
                    <label htmlFor="fourWheelDrive" className="text-sm">
                      4 Wheel Drive
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allWheelSteering"
                      checked={technicalFeatures.allWheelSteering}
                      onCheckedChange={(checked) => handleFeatureChange("allWheelSteering", checked as boolean)}
                    />
                    <label htmlFor="allWheelSteering" className="text-sm">
                      All Wheel Steering
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allWheelDrive"
                      checked={technicalFeatures.allWheelDrive}
                      onCheckedChange={(checked) => handleFeatureChange("allWheelDrive", checked as boolean)}
                    />
                    <label htmlFor="allWheelDrive" className="text-sm">
                      All Wheel Drive
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="antiLockBrakes"
                      checked={technicalFeatures.antiLockBrakes}
                      onCheckedChange={(checked) => handleFeatureChange("antiLockBrakes", checked as boolean)}
                    />
                    <label htmlFor="antiLockBrakes" className="text-sm">
                      Anti-Lock Brakes/ABS
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <div className="text-xs text-gray-600 leading-relaxed">
              <p className="mb-2">
                MAKE SURE THE CAR INFORMATION YOU HAVE ENTERED IS CORRECT. YOU WILL ONLY BE ABLE TO MAKE SELECT CHANGES
                ONCE THE AD IS LIVE.
              </p>
              <p className="mb-2">
                You'll get questions?{" "}
                <Link href="#" className="text-red-600 underline">
                  Get questions email us.
                </Link>
              </p>
              <p>
                By clicking publish, I confirm that I have read the information above and confirm that such information
                is complete and accurate.{" "}
                <Link href="#" className="text-red-600 underline">
                  Terms & conditions.
                </Link>
              </p>
            </div>

            <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium">
              PUBLISH LISTING
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FinalListingForm
