"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Heart, Share2, CheckCircle, Calendar, Gauge, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient, type Item } from "@/lib/api"

export default function DescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        console.log("Fetching item with ID:", params.id)
        const response = await apiClient.getItemById(params.id as string)
        console.log("Item response:", response)

        // Handle the API response structure: { message: string, item: Item }
        if (response && (response as any).item) {
          console.log("Setting item from response.item:", (response as any).item)
          setItem((response as any).item as Item)
        } else if (response && (response as any)._id) {
          // Fallback: If response is already the item object
          console.log("Setting item from response directly:", response)
          setItem(response as Item)
        } else {
          console.log("Invalid response structure:", response)
          setError("Invalid item data received")
        }
      } catch (err) {
        setError("Failed to load item details")
        console.error("Error fetching item:", err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  const nextImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  const formatPrice = (price: number, currency: string = "Frw") => {
    return `${currency} ${price.toLocaleString()}`
  }

  const formatLocation = (location: any) => {
    if (typeof location === "string") return location
    if (typeof location === "object" && location) {
      const parts = []
      if (location.city) parts.push(location.city)
      if (location.district) parts.push(location.district)
      return parts.join(", ") || "Location not specified"
    }
    return "Location not specified"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Item not found"}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SOKO<span className="text-red-600">GO</span>
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/search" className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Search
              </a>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Car Image Section */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative h-96">
                <img
                  src={item.images?.[currentImageIndex] || "/placeholder.svg?height=400&width=600&query=car"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* 360° View Button */}
                <div className="absolute bottom-4 left-4">
                  <Button variant="secondary" size="sm" className="bg-gray-800/80 text-white hover:bg-gray-800">
                    <span className="mr-2">🔄</span>
                    360° View
                  </Button>
                </div>

                {/* Navigation Arrows */}
                {item.images && item.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {item.images && item.images.length > 1 && (
                <div className="p-4 flex gap-2">
                  {item.images.slice(0, 2).map((image, index) => (
                    <div key={index} className="relative w-24 h-16 rounded overflow-hidden">
                      <img
                        src={image}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 1 && item.images.length > 2 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
                          +{item.images.length - 2}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car Details Section */}
            <div className="bg-white rounded-lg p-6">
              {/* Price and Actions */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {formatPrice(item.price, item.currency)}
                </h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? "text-red-600 border-red-600" : ""}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-600" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Car Title */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{item.title}</h2>

              {/* Basic Car Information */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                {item.features?.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {item.features.year}
                  </div>
                )}
                {item.features?.kilometers && (
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    {item.features.kilometers.toLocaleString()} km
                  </div>
                )}
                {item.features?.transmissionType && (
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    {item.features.transmissionType}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Rwanda Specs
                </div>
              </div>

              {/* Warranty Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Dealer Warranty
                </span>
              </div>

              {/* Car Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Overview</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Interior Color</span>
                      <p className="font-medium">{item.features?.interiorColor || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Exterior Color</span>
                      <p className="font-medium">{item.features?.exteriorColor || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Body Type</span>
                      <p className="font-medium">{item.features?.bodyType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Seating Capacity</span>
                      <p className="font-medium">{item.features?.seatingCapacity || "N/A"} Seater</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Transmission Type</span>
                      <p className="font-medium">{item.features?.transmissionType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Steering Side</span>
                      <p className="font-medium">{item.features?.steeringSide || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Horsepower</span>
                      <p className="font-medium">{item.features?.horsePower || "N/A"} HP</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Doors</span>
                      <p className="font-medium">{item.features?.doors || "N/A"} door{item.features?.doors !== 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Fuel Type</span>
                      <p className="font-medium">{item.features?.fuelType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Make</span>
                      <p className="font-medium">{item.features?.make || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Model</span>
                      <p className="font-medium">{item.features?.model || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Warranty</span>
                      <p className="font-medium">{item.features?.warranty === "yes" ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty and Price Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">
                  {item.features?.year || "N/A"} {item.features?.make || "N/A"} {item.features?.model || "N/A"} - {item.features?.bodyType || "N/A"}
                </p>
                <p className="text-gray-700 mb-2">
                  {item.features?.warranty === "yes" ? "Warranty Available" : "No Warranty"} •
                  {item.features?.isInsuredInRwanda === "yes" ? " Insured in Rwanda" : " Not Insured in Rwanda"} •
                  {item.features?.technicalControl === "yes" ? " Technical Control Passed" : " Technical Control Required"}
                </p>
                <p className="text-gray-700">
                  Price: ({formatPrice(item.price, item.currency)}), (${(item.price / 1200).toLocaleString()})
                </p>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium mt-2">
                  Read More
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Posted on: {new Date(item.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Vehicle Features</h4>
                  <span className="text-sm text-gray-500">6 ↗</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    item.features?.cruiseControl ? "Cruise Control" : null,
                    item.features?.technicalControl === "yes" ? "Technical Control Passed" : null,
                    item.features?.isInsuredInRwanda === "yes" ? "Insured in Rwanda" : null,
                    item.features?.warranty === "yes" ? "Warranty Available" : null,
                    item.features?.steeringSide ? `${item.features.steeringSide} Hand Drive` : null,
                    item.features?.fuelType ? `${item.features.fuelType} Fuel` : null
                  ].filter(Boolean).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
                {item.features && Object.keys(item.features).length === 0 && (
                  <p className="text-gray-500 text-sm">No specific features listed</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                  SOKO
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SOKOGO Group L.L.C</h3>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Verified</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Dealer</p>
              <Button variant="outline" className="w-full">
                View All Cars
              </Button>
            </div>
            {/* Contact Buttons */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Seller</h3>
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button className="flex-1 bg-green-500 hover:bg-green-600">
                  <span className="mr-2">💬</span>
                  WhatsApp
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <span className="mr-2">💬</span>
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
