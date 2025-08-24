"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, type Item } from "@/lib/api"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset image index when item changes
  useEffect(() => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex(0)
    } else {
      setCurrentImageIndex(0)
    }
  }, [item])

  // Ensure currentImageIndex is within bounds
  useEffect(() => {
    if (item?.images && item.images.length > 0 && currentImageIndex >= item.images.length) {
      setCurrentImageIndex(0)
    }
  }, [item, currentImageIndex])

  // Debug: Log item state changes
  useEffect(() => {
    console.log("Item state updated:", item)
  }, [item])
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    duration: 1,
    specialRequests: "",
  })

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        console.log("Fetching item with ID:", params.id)
        const response = await apiClient.getItemById(params.id as string)
        console.log("Item response:", response)

        // Handle the nested response structure
        if (response && (response as any).item) {
          console.log("Setting item from response.item:", (response as any).item)
          setItem((response as any).item as Item)
        } else if (response && (response as any)._id) {
          // If response is already the item object
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Handle booking logic here
      console.log("Booking data:", bookingData)
      console.log("Item ID:", params.id)

      // You can add API call here to submit booking
      // await apiClient.createBooking({
      //   itemId: params.id as string,
      //   ...bookingData
      // })

      alert("Booking request submitted! We will contact you soon.")
      router.push("/dashboard")
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to submit booking. Please try again.")
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading   details...</p>
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
                📊 Dashboard
              </a>
              <a href="/dashboard" className="text-red-600 px-3 py-2 text-sm font-medium">
                📊 Dashboard
              </a>
              <a
                href="/dashboard/electronics"
                className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium"
              >
                📱 Electronics
              </a>
              <a
                href="/dashboard/properties"
                className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium"
              >
                🏠 Properties
              </a>
              <a href="/dashboard" className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium">
                👤 Profile
              </a>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column -   Details */}
          <div className="space-y-6">
            {/* Item Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-lg">
              <h1 className="text-2xl font-bold">{item.title || "Item Title"}</h1>
              <p className="text-red-100 mt-2">
                Status: {item.status === "ACTIVE" ? "Available for booking" : "Not available"}
              </p>
            </div>

            {/* Item Image */}
            <div className="relative bg-white rounded-b-lg overflow-hidden">
              <div className="relative h-80">
                <img
                  src={item.images?.[currentImageIndex] || "/placeholder.svg?height=320&width=600&query=car"}
                  alt={item.title || "Item Image"}
                  className="w-full h-full object-cover"
                />

                {item.images && item.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {item.images?.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description || "No description available"}</p>
            </div>
          </div>

                      {/* Right Column - Booking Section */}
            <div className="space-y-6">
              {/* Book Now Button */}
              <div className="bg-red-600 text-white p-6 rounded-t-lg">
                <h2 className="text-2xl font-bold mb-4">Book This Item</h2>
                {item.bookingUrl ? (
                  <a
                    href={item.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="w-full bg-white text-red-600 hover:bg-gray-100 py-4 text-lg font-semibold">
                      📋 Book Now
                    </Button>
                  </a>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-100 mb-3">Booking form not available</p>
                    <p className="text-sm text-red-200">Please contact the seller directly</p>
                  </div>
                )}
              </div>

              {/* Item Specifications */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Specifications</h3>

                {/* Common Specifications */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="text-lg font-semibold text-gray-900">{item.category || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subcategory</h3>
                    <p className="text-lg font-semibold text-gray-900">{item.subcategory || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.currency || "Frw"} {item.price ? item.price.toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="text-lg font-semibold text-gray-900">{item.status || "N/A"}</p>
                  </div>
                </div>

                {/* Category-specific Specifications */}
                {item.category === "MOTORS" && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Vehicle Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Brand & Model</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.features?.brand || "N/A"} {item.features?.model || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Year</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.features?.year ? item.features.year.toString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Mileage</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.features?.mileage ? item.features.mileage.toLocaleString() : "N/A"} km
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fuel Type</h3>
                        <p className="text-lg font-semibold text-gray-900">{item.features?.fuelType || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Transmission</h3>
                        <p className="text-lg font-semibold text-gray-900">{item.features?.transmission || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {item.category === "PROPERTY" && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Property Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Bedrooms</h3>
                        <p className="text-lg font-semibold text-gray-900">{item.features?.bedrooms || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Bathrooms</h3>
                        <p className="text-lg font-semibold text-gray-900">{item.features?.bathrooms || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Area</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.features?.area || "N/A"} {item.features?.areaUnit || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {item.category === "ELECTRONICS" && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">Electronics Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                        <p className="text-lg font-semibold text-gray-900">{item.features?.condition || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Warranty</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {item.features?.warranty ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* Location & Contact */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-red-600" />
                  <span>
                    {item.location?.address || "N/A"}, {item.location?.district || "N/A"}, {item.location?.city || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-red-600" />
                  <span>{item.contactInfo?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-red-600" />
                  <span>{item.contactInfo?.email || "N/A"}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Seller</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3 text-red-600" />
                    <span>{item.contactInfo?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3 text-red-600" />
                    <span>{item.contactInfo?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span>
                      {item.location?.address || "N/A"}, {item.location?.district || "N/A"}, {item.location?.city || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
