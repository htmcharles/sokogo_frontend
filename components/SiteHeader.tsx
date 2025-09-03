"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="text-gray-800">SOKO</span>
            <span className="text-red-600">GO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">HOME</Link>
            {isAuthenticated ? (
              <>
                {user?.role === "admin" ? (
                  <Link href="/admin" className="text-gray-700 hover:text-gray-900">ADMIN PANEL</Link>
                ) : user?.role === "seller" ? (
                  <Link href="/seller" className="text-gray-700 hover:text-gray-900">SELLER PANEL</Link>
                ) : (
                  <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">DASHBOARD</Link>
                )}
                <span className="text-gray-700 hidden lg:inline">Welcome, {user?.firstName}</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-gray-900">LOG IN</Link>
                <Link href="/register" className="text-gray-700 hover:text-gray-900">REGISTER</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            <Link href="/" onClick={closeMobile} className="block py-2 text-gray-700">HOME</Link>
            {isAuthenticated ? (
              <>
                {user?.role === "admin" ? (
                  <Link href="/admin" onClick={closeMobile} className="block py-2 text-gray-700">ADMIN PANEL</Link>
                ) : user?.role === "seller" ? (
                  <Link href="/seller" onClick={closeMobile} className="block py-2 text-gray-700">SELLER PANEL</Link>
                ) : (
                  <Link href="/dashboard" onClick={closeMobile} className="block py-2 text-gray-700">DASHBOARD</Link>
                )}
                <div className="py-2 text-gray-700">Welcome, {user?.firstName}</div>
                <Button
                  onClick={() => { logout(); closeMobile() }}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} className="block py-2 text-gray-700">LOG IN</Link>
                <Link href="/register" onClick={closeMobile} className="block py-2 text-gray-700">REGISTER</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default SiteHeader
