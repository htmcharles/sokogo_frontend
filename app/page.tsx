"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { apiClient, type Item } from "@/lib/api"
import { textVariant, fadeIn, staggerContainer, slideIn } from "@/lib/animations"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import CarCard from "@/components/CarCard"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("motors")
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    message: "",
  })
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [carsData, setCarsData] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    // First-visit register prompt with cooldown (7 days)
    try {
      if (!isAuthenticated) {
        const dismissedAt = localStorage.getItem("registerPromptDismissedAt")
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
        const now = Date.now()
        const shouldShow = !dismissedAt || (now - Number(dismissedAt)) > sevenDaysMs
        if (shouldShow) {
          setShowRegisterPrompt(true)
        }
      }
    } catch (e) {
      // ignore storage errors
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("[v0] Starting to fetch data from backend...")

        // Fetch popular items for cars only
        const [carsResponse] = await Promise.all([
          apiClient.getPopularItems("MOTORS").catch((error) => {
            return { items: [] }
          }),
        ])


        setCarsData(carsResponse.items.slice(0, 4)) // Show only first 4 items
      } catch (error) {
        console.error("Error fetching data:", error)
        // Keep empty arrays as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (activeCategory !== "all") params.set("category", activeCategory)
    router.push(`/search?${params.toString()}`)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", contactForm)
    // Reset form
    setContactForm({ fullName: "", email: "", message: "" })
    alert("Message sent successfully!")
  }

  const handleContactChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter subscription:", newsletterEmail)
    setNewsletterEmail("")
    alert("Successfully subscribed to newsletter!")
  }

  const formatPrice = (price: number) => {
    return `Frw ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      <Dialog open={showRegisterPrompt} onOpenChange={(open) => {
        setShowRegisterPrompt(open)
        if (!open) {
          try { localStorage.setItem("registerPromptDismissedAt", String(Date.now())) } catch {}
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your account?</DialogTitle>
            <DialogDescription>
              Join SOKOGO to post listings, save favorites, and message sellers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                try { localStorage.setItem("registerPromptDismissedAt", String(Date.now())) } catch {}
                setShowRegisterPrompt(false)
              }}
            >
              Maybe later
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                try { localStorage.setItem("registerPromptDismissedAt", String(Date.now())) } catch {}
                router.push("/register")
              }}
            >
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-gray-800">SOKO</span>
                <span className="text-red-600">GO</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                HOME
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                      ADMIN PANEL
                    </Link>
                  ) : user?.role === 'seller' ? (
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

            {/* CTA Button */}
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  if (user?.role === 'admin') {
                    router.push('/admin')
                  } else if (user?.role === 'seller') {
                    router.push('/seller')
                  } else {
                    router.push('/dashboard')
                  }
                } else {
                  router.push('/login')
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
            >
              PLACE YOUR AD
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url('/city-background.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center">
          <motion.div
            className="text-white mb-8 text-center"
            variants={textVariant(0.2) as any}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
            <p className="text-xl mb-4">Searching</p>

          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl w-full justify-center mx-auto"
            variants={fadeIn("up", "tween", 0.4, 0.6) as any}
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
            <Button type="submit" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 h-14 rounded-full shadow-lg font-semibold">
              Search
            </Button>
          </motion.form>
        </div>
      </div>

      {/* Popular in CARS Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-8"
          variants={textVariant(0.2) as any}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Popular in <span className="text-red-600">CARS</span>
        </motion.h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer(0.1, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {carsData.length > 0 ? (
              carsData.map((car) => (
                <CarCard key={car._id} car={car} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No cars available at the moment</p>
              </div>
            )}
          </motion.div>
        )}
      </section>



      {/* Why Choose Us Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={textVariant(0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose SOKOGO</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Our marketplace is designed for a seamless car-buying experience in Rwanda.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer(0.2, 0.1) as any}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div
              className="text-center"
              variants={fadeIn("up", "tween", 0.2, 0.6) as any}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">User-Friendly Interface</h3>
              <p className="text-gray-600">
                Our intuitive interface makes it easy to search for and find the perfect items across all categories.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={fadeIn("up", "tween", 0.4, 0.6) as any}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Secure Transactions</h3>
              <p className="text-gray-600">
                We offer secure communication channels to ensure your transactions are safe and protected.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={fadeIn("up", "tween", 0.6, 0.6) as any}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Instant Listings</h3>
              <p className="text-gray-600">
                Post your ads instantly and reach thousands of potential buyers across Rwanda.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Get in Touch</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800">KG 9 Ave, Kigali</p>
                      <p className="text-gray-600">Kigali, Rwanda</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-gray-800">+250 788 123 456</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-gray-800">contact@sokogo.rw</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  </div>
                  <p className="ml-7">Saturday: 9:00 AM - 4:00 PM</p>
                  <p className="ml-7">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={contactForm.fullName}
                    onChange={(e) => handleContactChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange("message", e.target.value)}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    className="w-full resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                <span className="text-white">SOKO</span>
                <span className="text-red-600">GO</span>
              </h3>
              <p className="text-gray-300">Your premier destination for buying and selling cars across Rwanda.</p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/motors" className="text-gray-300 hover:text-white">
                    Motors
                  </Link>
                </li>

              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-300 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-gray-300 hover:text-white">
                    Safety Tips
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-300 mb-4">Subscribe to receive special offers and updates.</p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 SOKOGO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
