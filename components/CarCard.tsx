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

  // Extract car details from title or features
  const getCarDetails = () => {
    const title = car.title || ""
    const features = car.features || {}

    // Try to extract make, model, trim from title
    const titleParts = title.split(" ")
    let make = titleParts[0] || "Unknown"
    let model = titleParts[1] || ""
    let trim = ""

    // Look for trim indicators
    const trimIndicators = ["DLX", "LX", "EX", "SE", "LE", "GT", "Sport", "Limited", "Premium"]
    for (let i = 2; i < titleParts.length; i++) {
      if (trimIndicators.some(indicator => titleParts[i].toUpperCase().includes(indicator))) {
        trim = titleParts[i]
        break
      }
    }

    // If no trim found, use remaining parts as model
    if (!trim && titleParts.length > 2) {
      model = titleParts.slice(1).join(" ")
    }

    return {
      make,
      model,
      trim,
      year: features.year || "N/A",
      mileage: features.kilometers || features.mileage || 0
    }
  }

  const carDetails = getCarDetails()

  return (
    <Link href={`/description/${car._id}`} className={`block ${className}`}>
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        whileHover="hover"
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gray-100">
          <img
            src={car.images?.[0] || "/placeholder.svg?height=200&width=300&query=car"}
            alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 h-8 w-8 p-0 rounded-full"
              onClick={handleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 h-8 w-8 p-0 rounded-full"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Count Badge */}
          {car.images && car.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {car.images.length} photos
            </div>
          )}
        </div>

        {/* Content Section - Matching the image design */}
        <div className="p-4 space-y-3">
          {/* Price - Prominently displayed */}
          <div className="text-center">
            <p className="text-gray-900 font-bold text-xl">
              {formatPrice(car.price, car.currency)}
            </p>
          </div>

          {/* Make • Model • Trim */}
          <div className="text-center">
            <h3 className="text-gray-800 font-semibold text-lg leading-tight">
              {carDetails.make} • {carDetails.model}
              {carDetails.trim && ` • ${carDetails.trim}`}
            </h3>
          </div>

          {/* Year • Mileage */}
          <div className="text-center">
            <p className="text-gray-600 font-medium text-sm">
              {carDetails.year} • {carDetails.mileage.toLocaleString()} km
            </p>
          </div>

          {/* Location */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              {formatLocation(car.location)}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
