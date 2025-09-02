"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"   // ✅ API client
import { selectOptions } from "@/data/selectOptions"  // ✅ import your car models list
import type { Item } from "@/lib/api"
import SearchCarCard from "@/components/SearchCarCard"

export default function SearchPage() {
    const Makes = selectOptions.makes
     const initialParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const [searchQuery, setSearchQuery] = useState(initialParams?.get("q") || "")
  const [activeMake, setActiveMake] = useState(initialParams?.get("Make") || "")
  const [results, setResults] = useState<Item[]>([])
  const { isAuthenticated, user } = useAuth()

  // ✅ Fetch items from DB
  // Search logic: First filter by search query, then by Make feature
  // This ensures that Make filter only applies to items that match the search query
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { items } = await apiClient.getAllItems()

        let filtered = items

        // First filter by search query
        if (searchQuery.trim()) {
          const searchText = searchQuery.toLowerCase()
          console.log(`[Search] Filtering by query: "${searchText}"`)
          const beforeQueryFilter = filtered.length
          filtered = filtered.filter(
            (item) =>
              (item.title && item.title.toLowerCase().includes(searchText)) ||
              (item.description && item.description.toLowerCase().includes(searchText)) ||
              (item.location?.district && item.location.district.toLowerCase().includes(searchText)) ||
              (item.location?.city && item.location.city.toLowerCase().includes(searchText)) ||
              (item.features?.make && item.features.make.toLowerCase().includes(searchText)) ||
              (item.features?.brand && item.features.brand.toLowerCase().includes(searchText)) ||
              (item.features?.model && item.features.model.toLowerCase().includes(searchText))
          )
          console.log(`[Search] After query filter: ${beforeQueryFilter} -> ${filtered.length} items`)
        }

        // Then filter by Make if selected (only from the search results)
        if (activeMake) {
          console.log(`[Search] Filtering by Make: "${activeMake}"`)
          const beforeMakeFilter = filtered.length
          filtered = filtered.filter((item) =>
            item.features?.make && item.features.make.toLowerCase() === activeMake.toLowerCase()
          )
          console.log(`[Search] After Make filter: ${beforeMakeFilter} -> ${filtered.length} items`)
        }

        console.log(`[Search] Final results: ${filtered.length} items found`)
        setResults(filtered)
      } catch (error) {
        console.error("Error fetching items:", error)
      }
    }

    fetchItems()
  }, [searchQuery, activeMake])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (activeMake) params.set("Make", activeMake)
    window.history.replaceState(null, "", `/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* ... keep your header code unchanged ... */}

      {/* Search Section */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex space-x-2 mb-6 flex-wrap">
              {Makes.map((model) => (
                <button
                  key={model.value}
                  onClick={() => setActiveMake(model.value)}
                  className={`px-6 py-2 rounded-full font-medium ${
                    activeMake === model.value
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for cars, locations..."
                className="w-full h-12 pl-4 pr-12 rounded-full border-0 text-gray-800"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-full"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Search Results{" "}
            {searchQuery && `for "${searchQuery}"`}
            {activeMake && ` in ${Makes.find(m => m.value === activeMake)?.label}`}
          </h2>
          <p className="text-gray-600 mt-2">{results.length} items found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((item) => (
            <SearchCarCard key={item._id} car={item} />
          ))}
        </div>

        {results.length === 0 && (searchQuery || activeMake) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No results found {searchQuery && `for "${searchQuery}"`}{" "}
              {activeMake && `in ${Makes.find(m => m.value === activeMake)?.label}`}
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search terms or browse other car models
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
