"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { carsData } from "@/data/cars"
import { propertiesData } from "@/data/properties"
import { electronicsData } from "@/data/electronics"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all")
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    performSearch()
  }, [searchQuery, activeCategory])

  const performSearch = () => {
    let allData: any[] = []

    if (activeCategory === "all" || activeCategory === "motors") {
      allData = [...allData, ...carsData.map((item) => ({ ...item, type: "car" }))]
    }
    if (activeCategory === "all" || activeCategory === "property") {
      allData = [...allData, ...propertiesData.map((item) => ({ ...item, type: "property" }))]
    }
    if (activeCategory === "all" || activeCategory === "electronics") {
      allData = [...allData, ...electronicsData.map((item) => ({ ...item, type: "electronics" }))]
    }

    if (searchQuery.trim()) {
      const filtered = allData.filter((item) => {
        const searchText = searchQuery.toLowerCase()
        if (item.type === "car") {
          return (
            item.brand.toLowerCase().includes(searchText) ||
            item.model.toLowerCase().includes(searchText) ||
            item.variant.toLowerCase().includes(searchText)
          )
        } else if (item.type === "property") {
          return item.location.toLowerCase().includes(searchText)
        } else if (item.type === "electronics") {
          return (
            item.brand.toLowerCase().includes(searchText) ||
            item.model.toLowerCase().includes(searchText) ||
            item.specs.toLowerCase().includes(searchText)
          )
        }
        return false
      })
      setResults(filtered)
    } else {
      setResults(allData)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-gray-800">SOKO</span>
                <span className="text-red-600">GO</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                ALL DISTRICTS
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                HOME
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                LOG IN
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-gray-900">
                REGISTER
              </Link>
            </nav>

            <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full">PLACE YOUR AD</Button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeCategory === "all" ? "bg-red-600 text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory("motors")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeCategory === "motors" ? "bg-red-600 text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                MOTORS
              </button>
              <button
                onClick={() => setActiveCategory("property")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeCategory === "property" ? "bg-red-600 text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                PROPERTY
              </button>
              <button
                onClick={() => setActiveCategory("electronics")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeCategory === "electronics" ? "bg-red-600 text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                ELECTRONICS
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything"
                className="w-full h-12 pl-4 pr-12 rounded-full border-0 text-gray-800"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-full">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Search Results {searchQuery && `for "${searchQuery}"`}</h2>
          <p className="text-gray-600 mt-2">{results.length} items found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((item, index) => (
            <div
              key={`${item.type}-${item.id}-${index}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={
                  item.type === "car"
                    ? `${item.brand} ${item.model}`
                    : item.type === "property"
                      ? "Property"
                      : `${item.brand} ${item.model}`
                }
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-red-600 font-bold text-lg mb-1">{item.price}</p>
                {item.type === "car" && (
                  <>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {item.brand} • {item.model} • {item.variant}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.year} • {item.mileage}
                    </p>
                  </>
                )}
                {item.type === "property" && (
                  <>
                    <p className="text-gray-800 font-medium mb-2">
                      {item.beds} beds • {item.baths} baths • {item.area}
                    </p>
                    <p className="text-gray-600 text-sm">{item.location}</p>
                  </>
                )}
                {item.type === "electronics" && (
                  <>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {item.brand} • {item.model} • {item.specs}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.condition}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or browse all categories</p>
          </div>
        )}
      </div>
    </div>
  )
}
