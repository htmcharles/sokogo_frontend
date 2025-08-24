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
import { Plus, Users, Package, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { apiClient, type User } from "@/lib/api"

interface Seller extends User {
  status?: 'active' | 'inactive'
}

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth()
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  // Fetch sellers from API
  const fetchSellers = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getUsersByRole("seller", page)
      setSellers(response.users)
      setTotalPages(response.pagination.totalPages)
      setTotalUsers(response.pagination.totalUsers)
      setCurrentPage(response.pagination.currentPage)
    } catch (err) {
      console.error("Error fetching sellers:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch sellers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSellers(1)
    }
  }, [isAdmin])

  const handleLogout = () => {
    logout()
  }

  const resetFormState = () => {
    setRegisterError(null)
    setRegisterSuccess(false)
    setIsRegistering(false)
  }

  const handleRegisterSeller = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsRegistering(true)
    setRegisterError(null)
    setRegisterSuccess(false)

    const formData = new FormData(e.currentTarget)
    const userData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      role: 'seller' as const
    }

    try {
      await apiClient.register(userData)
      setRegisterSuccess(true)
      setShowRegisterForm(false)
      // Refresh the sellers list
      fetchSellers(currentPage)
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      console.error("Error registering seller:", err)
      setRegisterError(err instanceof Error ? err.message : "Failed to register seller")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
            <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">
                  <span className="text-gray-800">ADMIN</span>
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
        <div className=" bg-white text-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Admin Control Panel</h1>
            <p className="text-xl text-black">Manage sellers, monitor platform activity, and oversee marketplace operations</p>
          </div>
        </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Sellers</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                <p className="text-xs text-gray-500">Total sellers in the system</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Products</CardTitle>
                <Package className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500">Products across all categories</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">System Status</CardTitle>
                <Settings className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-gray-500">All systems operational</p>
              </CardContent>
            </Card>
          </div>

                  {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sellers List */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900">Manage Sellers</CardTitle>
                    <Button onClick={() => setShowRegisterForm(true)} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Seller
                    </Button>
                  </div>
                </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSellers(currentPage)}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading sellers...</p>
                  </div>
                ) : sellers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sellers found</p>
                    <Button onClick={() => setShowRegisterForm(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Seller
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellers.map((seller) => (
                      <div key={seller._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{seller.firstName} {seller.lastName}</h3>
                          <p className="text-sm text-gray-600">{seller.email}</p>
                          <p className="text-sm text-gray-600">{seller.phoneNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={seller.status === 'active' ? 'default' : 'secondary'}>
                            {seller.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {sellers.length} of {totalUsers} sellers
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSellers(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSellers(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Review Products
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>New seller registered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Product review completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>System backup completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {registerSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Seller Registered Successfully!</h2>
            <p className="text-gray-600 mb-4">The new seller account has been created and can now log in.</p>
            <Button onClick={() => setRegisterSuccess(false)} className="w-full">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Register Seller Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Seller</h2>
            <form onSubmit={handleRegisterSeller} className="space-y-4">
              {registerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{registerError}</p>
                </div>
              )}

              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isRegistering}>
                  {isRegistering ? "Registering..." : "Register Seller"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRegisterForm(false)
                    resetFormState()
                  }}
                  className="flex-1"
                  disabled={isRegistering}
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
