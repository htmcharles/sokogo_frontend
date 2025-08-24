"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useState } from "react"
import { User, Mail, Phone, MapPin, Tag, Edit } from "lucide-react"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("information")

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-gray-800">SOKO</span>
                <span className="text-red-600">GO</span>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" className="text-red-600 font-medium flex items-center">
                  <span className="mr-2">📊</span> Dashboard
                </Link>
                <Link href="/dashboard/cars" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">🚗</span> Cars
                </Link>
                <Link href="/dashboard/electronics" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">📱</span> Electronics
                </Link>
                <Link href="/dashboard/properties" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">🏠</span> Properties
                </Link>
                <Link href="/dashboard/profile" className="text-gray-600 hover:text-red-600 flex items-center">
                  <span className="mr-2">👤</span> Profile
                </Link>
              </nav>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="bg-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome, {user?.firstName?.toUpperCase() || "USER"}!</h1>
            <p className="text-xl text-red-100">Manage your listings, orders, and marketplace activity</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="information" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Your Information
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Your Listings
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Your Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="information">
              <Card>
                <CardHeader className="bg-red-600 text-white">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <User className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-lg font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Mail className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Phone className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                          <p className="text-lg font-medium text-gray-900">{user?.phoneNumber || "+250 XXX XXX XXX"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <MapPin className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                          <p className="text-lg font-medium text-gray-900">Kigali, Rwanda</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Tag className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            SELLER
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button className="bg-red-600 hover:bg-red-700 flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>Your Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-6">Start selling by creating your first listing</p>
                    <Button className="bg-red-600 hover:bg-red-700">Create Your First Listing</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Your purchase history will appear here</p>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
