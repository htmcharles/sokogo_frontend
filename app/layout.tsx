import type React from "react"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { NextAuthProvider } from "@/components/next-auth-provider"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata = {
  title: "SOKOGO - Buy & Sell Cars in Rwanda",
  description:
    "Rwanda's premier marketplace for cars. Buy and sell with confidence on SOKOGO.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en">
          <body className={`${montserrat.variable} font-montserrat antialiased`}>
        <NextAuthProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
