"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Item } from "@/lib/api"

interface CarCardProps {
  car: Item
  className?: string
}

export default function CarCard({ car, className = "" }: CarCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Share functionality can be implemented here
    if (navigator.share) {
      navigator.share({
        title: car.title,
        text: car.description,
        url: window.location.origin + `/description/${car._id}`,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/description/${car._id}`)
    }
  }

  return (
    <Link href={`/description/${car._id}`} className={`block ${className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        {/* Image Section */}
        <div className="relative h-48">
          <img
            src={car.images?.[0] || "/placeholder.svg?height=200&width=300&query=car"}
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                (car.status || "AVAILABLE") === "AVAILABLE" || (car.status || "ACTIVE") === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {car.status || "AVAILABLE"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white text-gray-700 hover:text-red-600"
              onClick={handleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white text-gray-700 hover:text-red-600"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Count Badge */}
          {car.images && car.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {car.images.length} photos
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-600 font-bold text-lg">
              {formatPrice(car.price, car.currency)}
            </p>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {car.title}
          </h3>

          {/* Car Details */}
          {car.category === "MOTORS" && car.features && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              {car.features.year && (
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  {car.features.year}
                </span>
              )}
              {(car.features.kilometers || car.features.mileage) && (
                <span className="flex items-center gap-1">
                  <span>🛣️</span>
                  {(car.features.kilometers || car.features.mileage)?.toLocaleString()} km
                </span>
              )}
              {(car.features.transmissionType || car.features.transmission) && (
                <span className="flex items-center gap-1">
                  <span>⚙️</span>
                  {car.features.transmissionType || car.features.transmission}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          <p className="text-gray-500 text-sm">
            {formatLocation(car.location)}
          </p>

          {/* Additional Info */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Posted {new Date(car.createdAt).toLocaleDateString()}</span>
            {car.condition && (
              <span className="capitalize">{car.condition}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
