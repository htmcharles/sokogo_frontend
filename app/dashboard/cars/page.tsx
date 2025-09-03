"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { SiteHeader } from "@/components/SiteHeader"
import { useState, useEffect } from "react"
import { apiClient, type Item } from "@/lib/api"
import Image from "next/image"
import CarCard from "@/components/CarCard"

interface Car extends Item {
  year?: number
  mileage?: string
  transmission?: string
  status?: string
}

export default function CarsPage() {
  const { user, logout } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setError(null)
        const data = await apiClient.getPopularItems("MOTORS")
        setCars(data.items || [])
      } catch (error) {
        console.error("Failed to fetch cars:", error)
        setError("Failed to load cars. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  const handleLogout = () => {
    logout()
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
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
        <SiteHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Cars</h1>
            <p className="text-gray-600">Browse and book cars from our marketplace</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cars...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading cars</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => typeof window !== "undefined" && window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}

          {!loading && cars.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cars available</h3>
              <p className="text-gray-500">Check back later for new listings</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
