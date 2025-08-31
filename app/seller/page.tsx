"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, TrendingUp, DollarSign, LogOut, Edit, Trash2 } from "lucide-react"
import { apiClient, type Item } from "@/lib/api"

export default function SellerDashboard() {
  const { user, isSeller, logout } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Fetch seller's products from API
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!isSeller || !user) return
      try {
        setIsLoading(true)
        console.log("[v0] Fetching seller products for user:", user._id)
        console.log("[v0] API client authenticated:", apiClient.isAuthenticated())
        const response = await apiClient.getMyItems()
        setProducts(response.items)
      } catch (error) {
        console.error("Failed to fetch seller products:", error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSellerProducts()
  }, [isSeller, user])

  const handleLogout = () => {
    logout()
  }

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory)

  return (
    <RoleProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">
                  <span className="text-gray-800">SELLER</span>
                  <span className="text-red-600">DASHBOARD</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.firstName}</span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats and Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Products</CardTitle>
                <Package className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <p className="text-xs text-gray-500">Products in your inventory</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Listings</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'ACTIVE' || p.status === 'AVAILABLE').length}
                </div>
                <p className="text-xs text-gray-500">Currently available</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  Frw {products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Combined inventory value</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter and Add Product */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="category" className="text-gray-700">Filter by Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="MOTORS">Motors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => router.push("/category")} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products found</p>
                <Button onClick={() => router.push("/category")} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product._id} className="bg-white border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                      <Badge variant={product.status === 'ACTIVE' || product.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-600">
                        {product.currency} {product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  )
}
