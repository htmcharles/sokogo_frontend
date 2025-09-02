"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cardVariant, tiltVariant } from "@/lib/animations"
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
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: car.title,
        text: car.description,
        url: window.location.origin + `/description/${car._id}`,
      })
    } else if (typeof window !== "undefined") {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/description/${car._id}`)
    }
  }

    return (
    <Link href={`/description/${car._id}`} className={`block ${className}`}>
      <motion.div
        className="bg-white rounded-lg overflow-hidden group"
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        whileHover="hover"
      >
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-64 h-48 flex-shrink-0">
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
          <div className="flex-1 p-6">
            {/* Price */}
            <div className="mb-3">
              <p className="text-red-600 font-bold text-2xl">
                {formatPrice(car.price, car.currency)}
              </p>
            </div>

            {/* Title and Details */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-800 text-lg mb-1">
                {car.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {car.features?.make || car.features?.brand} • {car.features?.model} • {car.features?.year} • {car.condition?.toUpperCase()}
              </p>
            </div>

            {/* Car Specifications */}
            {car.category === "MOTORS" && car.features && (
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                {car.features.year && (
                  <span>{car.features.year}</span>
                )}
                {(car.features.kilometers || car.features.mileage) && (
                  <span>{(car.features.kilometers || car.features.mileage)?.toLocaleString()} KM</span>
                )}
                <span>LEFT HAND</span>
              </div>
            )}

            {/* Location */}
            <div className="mb-3">
              <p className="text-gray-700 font-medium">
                {formatLocation(car.location)}
              </p>
            </div>

            {/* Seller Information */}
            <div className="text-sm text-gray-600">
              <p>Listed by {car.seller?.name || 'SELLER NAME'}</p>
              <p className="text-blue-600 font-medium">{car.seller?.phone || '078 123 456'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
