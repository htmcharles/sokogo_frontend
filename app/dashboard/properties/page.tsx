"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiClient, type Item } from "@/lib/api"
import Image from "next/image"

interface Property extends Item {
  bedrooms?: number
  bathrooms?: number
  area?: string
  status?: string
}

export default function PropertiesPage() {
  const { user, logout } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setError(null)
        const data = await apiClient.getPopularItems("PROPERTY")
        setProperties(data.items || [])
      } catch (error) {
        console.error("Failed to fetch properties:", error)
        setError("Failed to load properties. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const formatLocation = (location: any) => {
    if (typeof location === "string") return location
    if (typeof location === "object" && location) {
      const parts = []
      if (location.address) parts.push(location.address)
      if (location.city) parts.push(location.city)
      return parts.join(", ") || "Location not specified"
    }
    return "Location not specified"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-gray-800">SOKO</span>
                <span className="text-red-600">GO</span>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">📊</span> Dashboard
                </Link>
                <Link href="/dashboard/cars" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">🚗</span> Cars
                </Link>
                <Link href="/dashboard/electronics" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">📱</span> Electronics
                </Link>
                <Link href="/dashboard/properties" className="text-red-600 font-medium flex items-center">
                  <span className="mr-2">🏠</span> Properties
                </Link>
                <Link href="/dashboard/profile" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">👤</span> Profile
                </Link>
              </nav>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Properties</h1>
            <p className="text-gray-600">Browse and book properties from our marketplace</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={property.images?.[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                                              <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            (property.status || "AVAILABLE") === "AVAILABLE" || (property.status || "ACTIVE") === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {property.status || "AVAILABLE"}
                        </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{formatLocation(property.location)}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bedrooms:</span>
                        <span className="font-medium">{property.bedrooms || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bathrooms:</span>
                        <span className="font-medium">{property.bathrooms || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Area:</span>
                        <span className="font-medium">{property.area || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-red-600">Frw {property.price.toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        {(property.status || "AVAILABLE") === "AVAILABLE" || (property.status || "ACTIVE") === "ACTIVE" ? (
                          <Link href={`/dashboard/properties/${property._id}/book`}>
                            <Button className="bg-red-600 hover:bg-red-700">Book Now</Button>
                          </Link>
                        ) : (
                          <Button disabled className="bg-gray-400 cursor-not-allowed">
                            Not Available
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && properties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available</h3>
              <p className="text-gray-500">Check back later for new listings</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
