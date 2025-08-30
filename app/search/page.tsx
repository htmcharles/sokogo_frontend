"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"   // ✅ import your API client
import type { Item } from "@/lib/api"
import CarCard from "@/components/CarCard"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "MOTORS")
  const [results, setResults] = useState<Item[]>([])
  const { isAuthenticated, user } = useAuth()

  // ✅ Fetch items from DB
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { items } = await apiClient.getAllItems()

        let filtered = items.filter((item) => item.category === "MOTORS")

        // Filter by search query
        if (searchQuery.trim()) {
          const searchText = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (item) =>
              (item.title && item.title.toLowerCase().includes(searchText)) ||
              (item.description && item.description.toLowerCase().includes(searchText)) ||
              (item.location?.district && item.location.district.toLowerCase().includes(searchText)) ||
              (item.location?.city && item.location.city.toLowerCase().includes(searchText))
          )
        }

        setResults(filtered)
      } catch (error) {
        console.error("Error fetching items:", error)
      }
    }

    fetchItems()
  }, [searchQuery, activeCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
              {isAuthenticated ? (
                <>
                  {user?.role === "admin" ? (
                    <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                      ADMIN PANEL
                    </Link>
                  ) : user?.role === "seller" ? (
                    <Link href="/seller" className="text-gray-700 hover:text-gray-900">
                      SELLER PANEL
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                      DASHBOARD
                    </Link>
                  )}
                  <span className="text-gray-700">Welcome, {user?.firstName}</span>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-gray-900">
                    LOG IN
                  </Link>
                  <Link href="/register" className="text-gray-700 hover:text-gray-900">
                    REGISTER
                  </Link>
                </>
              )}
            </nav>

            <Button
              onClick={() => {
                if (isAuthenticated) {
                  if (user?.role === "admin") {
                    window.location.href = "/admin"
                  } else if (user?.role === "seller") {
                    window.location.href = "/seller"
                  }else {
                    window.location.href = "/dashboard"
                  }
                } else {
                  window.location.href = "/login"
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
            >
              PLACE YOUR AD
            </Button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveCategory("MOTORS")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeCategory === "MOTORS" ? "bg-red-600 text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                MOTORS
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
          <h2 className="text-2xl font-bold text-gray-800">
            Search Results {searchQuery && `for "${searchQuery}"`}
          </h2>
          <p className="text-gray-600 mt-2">{results.length} items found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((item) => (
            <CarCard key={item._id} car={item} />
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
