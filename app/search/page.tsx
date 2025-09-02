"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"   // ✅ API client
import { selectOptions } from "@/data/selectOptions"  // ✅ import your car models list
import { staggerContainer, fadeIn, textVariant } from "@/lib/animations"
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
      <div
        className="relative h-96 bg-cover bg-center py-8"
        style={{
          backgroundImage: `url('/city-background.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.div
            className="text-white mb-8"
            variants={textVariant(0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
            <p className="text-xl mb-4">Searching in RWANDA &gt; MOTORS &gt; CARS</p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="flex gap-4 max-w-2xl"
            variants={fadeIn("up", "tween", 0.4, 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="flex-1 relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything"
                className="w-full h-14 pl-6 pr-12 rounded-full border-0 text-gray-900 bg-white/95 backdrop-blur-sm shadow-lg"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-8 h-14 rounded-full shadow-lg font-semibold"
            >
              Search
            </Button>
          </motion.form>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Sort */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                CARS FOR SALE IN RWANDA
              </h1>
              <p className="text-gray-600">• {results.length} ADS</p>
            </div>
          </div>

          {/* Make Filters */}
          <div className="flex space-x-2 mb-6 flex-wrap">
            {Makes.map((model) => {
              // Calculate actual count for this make
              const makeCount = results.filter((item) =>
                item.features?.make && item.features.make.toLowerCase() === model.value.toLowerCase()
              ).length;

              return (
                <button
                  key={model.value}
                  onClick={() => setActiveMake(model.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeMake === model.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {model.label} ({makeCount})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Car Listings */}
          <div className="flex-1">
            <motion.div
              className="space-y-6"
              variants={staggerContainer(0.1, 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {results.map((item) => (
                <SearchCarCard key={item._id} car={item} />
              ))}
            </motion.div>

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

          {/* Advertisement Banner
          <div className="w-64">
            <div className="bg-red-600 text-white p-6 rounded-lg flex items-center justify-center text-center sticky top-8">
              <div>
                <h3 className="text-lg font-bold mb-2">ADVERT</h3>
                <p className="text-sm">RELATED TO CARS</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
