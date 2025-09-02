"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function CompleteProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setUserAfterGoogleSignup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email || !session?.user?.name) return

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    if (!formData.phoneNumber.trim()) {
      alert("Phone number is required")
      return
    }

    setIsLoading(true)
    try {
      const [firstName, ...lastNameParts] = session.user.name.split(" ")
      const lastName = lastNameParts.join(" ") || ""

      const response = await apiClient.createGoogleUser({
        firstName,
        lastName,
        email: session.user.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password || undefined,
        role: "seller",
        googleId: session.user.id || session.user.email, // Use Google ID or email as fallback
      })

      console.log("[v0] Google user created successfully:", response)
      console.log("[v0] Response user object:", response.user)
      console.log("[v0] Response user._id:", response.user._id)

      const userData = {
        _id: response.user._id,
        firstName,
        lastName,
        email: session.user.email,
        phoneNumber: formData.phoneNumber,
        role: "seller" as const,
      }

      console.log("[v0] Created userData:", userData)

      setUserAfterGoogleSignup(userData)

      // The API client now handles storing userId and user data automatically
      // No need to manually set localStorage here

      router.push("/seller")
    } catch (error) {
      console.error("Profile completion error:", error)
      alert("Failed to complete profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {session.user.name}! Please provide some additional information to complete your seller account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set a password for email login"
              />
              <p className="text-sm text-gray-600 mt-1">
                Optional: Set a password to enable email/password login in addition to Google
              </p>
            </div>

            {formData.password && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
