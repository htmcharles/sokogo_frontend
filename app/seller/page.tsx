"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, TrendingUp, DollarSign, LogOut, Edit, Trash2 } from "lucide-react"
import { Item, apiClient } from "@/lib/api"

export default function SellerDashboard() {
  const { user, isSeller, logout } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Item[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [formCategory, setFormCategory] = useState<string>("")



  // Mock data for now - replace with actual API calls
  useEffect(() => {
    if (isSeller) {
      // Simulate loading products
      setTimeout(() => {
        setProducts([
          {
            _id: "1",
            title: "Toyota Land Cruiser 2020",
            description: "Excellent condition Toyota Land Cruiser with low mileage",
            price: 45000000,
            currency: "Frw",
            category: "MOTORS",
            subcategory: "SUV",
            seller: user?._id || "",
            images: ["https://example.com/image1.jpg"],
            status: "ACTIVE",
            location: {
              district: "Kigali",
              city: "Kigali",
              address: "Kimihurura"
            },
            features: {
              brand: "Toyota",
              model: "Land Cruiser",
              year: 2020,
              mileage: 25000,
              fuelType: "Diesel",
              transmission: "Automatic"
            },
            contactInfo: {
              phone: "+250788123456",
              email: "seller@example.com"
            },
            bookingUrl: "https://docs.google.com/forms/d/example",
            condition: "Excellent",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-15"
          }
        ])
        setIsLoading(false)
      }, 1000)
    }
  }, [isSeller, user])

  const handleLogout = () => {
    logout()
  }

  const resetFormState = () => {
    setCreateError(null)
    setCreateSuccess(false)
    setIsCreatingProduct(false)
    setFormCategory("")
  }

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreatingProduct(true)
    setCreateError(null)
    setCreateSuccess(false)

    const formData = new FormData(e.currentTarget)
    const category = formData.get('category') as "MOTORS" | "PROPERTY" | "ELECTRONICS"

    // Build features object based on category
    let features: any = {}

    if (category === "MOTORS") {
      features = {
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        year: parseInt(formData.get('year') as string),
        mileage: parseInt(formData.get('mileage') as string),
        fuelType: formData.get('fuelType') as string,
        transmission: formData.get('transmission') as string,
      }
    } else if (category === "PROPERTY") {
      features = {
        bedrooms: parseInt(formData.get('bedrooms') as string),
        bathrooms: parseInt(formData.get('bathrooms') as string),
        area: parseInt(formData.get('area') as string),
        areaUnit: formData.get('areaUnit') as string,
      }
    } else if (category === "ELECTRONICS") {
      features = {
        condition: formData.get('condition') as string,
        warranty: formData.get('warranty') === 'true',
      }
    }

    const productData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category,
      subcategory: formData.get('subcategory') as string,
      price: parseInt(formData.get('price') as string),
      currency: formData.get('currency') as string,
      location: {
        district: formData.get('district') as string,
        city: formData.get('city') as string,
        address: formData.get('address') as string,
      },
      images: [formData.get('imageUrl') as string].filter(Boolean),
      features,
      contactInfo: {
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
      }
    }

    try {
      await apiClient.createItem(productData)
      setCreateSuccess(true)
      setShowAddForm(false)
      // Refresh the products list
      // fetchProducts() // TODO: Implement this
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      console.error("Error creating product:", err)
      setCreateError(err instanceof Error ? err.message : "Failed to create product")
    } finally {
      setIsCreatingProduct(false)
    }
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
                <Button variant="outline" onClick={handleLogout} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <div className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Seller Control Panel</h1>
            <p className="text-xl text-gray-300">Manage your products, track sales, and grow your business</p>
          </div>
        </div>

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
                <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                <SelectItem value="PROPERTY">Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
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
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
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

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{createError}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input id="title" name="title" placeholder="Enter product title" required disabled={isCreatingProduct} />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    name="category"
                    required
                    disabled={isCreatingProduct}
                    value={formCategory}
                    onValueChange={setFormCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTORS">Motors</SelectItem>
                      <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                      <SelectItem value="PROPERTY">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Input id="subcategory" name="subcategory" placeholder="e.g., SUV, Smartphone, Apartment" required disabled={isCreatingProduct} />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" name="description" placeholder="Enter product description" rows={3} required disabled={isCreatingProduct} />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" name="price" type="number" placeholder="Enter price" required disabled={isCreatingProduct} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select name="currency" required disabled={isCreatingProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frw">Frw</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" name="district" placeholder="e.g., Kigali" required disabled={isCreatingProduct} />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" placeholder="e.g., Kigali" required disabled={isCreatingProduct} />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" placeholder="e.g., Kimihurura" required disabled={isCreatingProduct} />
                </div>
              </div>

              {/* Category-specific Features */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Category Features</h3>

                {/* Motors Features */}
                {formCategory === "MOTORS" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand *</Label>
                      <Input id="brand" name="brand" placeholder="e.g., Toyota" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input id="model" name="model" placeholder="e.g., Land Cruiser" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input id="year" name="year" type="number" placeholder="e.g., 2020" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage (km) *</Label>
                      <Input id="mileage" name="mileage" type="number" placeholder="e.g., 25000" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="fuelType">Fuel Type *</Label>
                      <Input id="fuelType" name="fuelType" placeholder="e.g., Diesel" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="transmission">Transmission *</Label>
                      <Input id="transmission" name="transmission" placeholder="e.g., Automatic" required disabled={isCreatingProduct} />
                    </div>
                  </div>
                )}

                {/* Property Features */}
                {formCategory === "PROPERTY" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Input id="bedrooms" name="bedrooms" type="number" placeholder="e.g., 3" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Input id="bathrooms" name="bathrooms" type="number" placeholder="e.g., 2" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="area">Area *</Label>
                      <Input id="area" name="area" type="number" placeholder="e.g., 150" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="areaUnit">Area Unit *</Label>
                      <Input id="areaUnit" name="areaUnit" placeholder="e.g., m²" required disabled={isCreatingProduct} />
                    </div>
                  </div>
                )}

                {/* Electronics Features */}
                {formCategory === "ELECTRONICS" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Input id="condition" name="condition" placeholder="e.g., Excellent" required disabled={isCreatingProduct} />
                    </div>
                    <div>
                      <Label htmlFor="warranty">Warranty *</Label>
                      <Select name="warranty" required disabled={isCreatingProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warranty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* No Category Selected */}
                {!formCategory && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Please select a category to see relevant features</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" placeholder="e.g., +250788123456" required disabled={isCreatingProduct} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" placeholder="e.g., seller@example.com" required disabled={isCreatingProduct} />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" placeholder="https://example.com/image.jpg" disabled={isCreatingProduct} />
                <p className="text-xs text-gray-500 mt-1">Add image URL (optional)</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isCreatingProduct}>
                  {isCreatingProduct ? "Creating Product..." : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    resetFormState()
                  }}
                  className="flex-1"
                  disabled={isCreatingProduct}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </RoleProtectedRoute>
  )
}
