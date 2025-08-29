"use client"

import { Card } from "@/components/ui/card"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

function CategorySelection() {
  const categories = [
    { name: "CARS", href: "/cars" },
    { name: "MOTORCYCLES", href: "/motorcycles" },
    { name: "TRUCKS", href: "/trucks" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          SOKO<span className="text-red-600">GO</span>
        </h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 text-balance">
          Now choose the right category for your ad:
        </h2>
      </div>

      <div className="flex items-center gap-2 mb-6 text-red-600">
        <Home className="w-4 h-4" />
        <span className="font-medium">MOTORS</span>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <Link key={category.name} href={category.href}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 text-lg">{category.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategorySelection
