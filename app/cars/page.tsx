"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function CarDetailsForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    location: "",
    makeModel: "",
    year: "",
    kilometers: "",
    bodyType: "",
    insured: "",
    technicalControl: "",
    price: "",
    phoneNumber: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem("carDetailsForm", JSON.stringify(formData))
    router.push("/cars/listing")
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Link href="/">
          <h1 className="text-4xl font-bold text-gray-800 cursor-pointer">
            SOKO<span className="text-red-600">GO</span>
          </h1>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 text-balance">Tell us more about your car</h2>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-red-600">
          <Home className="w-4 h-4" />
          <span className="font-medium">MOTORS</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium">CARS</span>
        </div>
        <Link href="/category">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="NYARUGENGE" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nyarugenge">NYARUGENGE</SelectItem>
              <SelectItem value="gasabo">GASABO</SelectItem>
              <SelectItem value="kicukiro">KICUKIRO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.makeModel} onValueChange={(value) => setFormData({ ...formData, makeModel: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="MAKE & MODEL*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toyota-camry">Toyota Camry</SelectItem>
              <SelectItem value="honda-civic">Honda Civic</SelectItem>
              <SelectItem value="nissan-altima">Nissan Altima</SelectItem>
              <SelectItem value="bmw-3series">BMW 3 Series</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="YEAR*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={formData.kilometers}
            onValueChange={(value) => setFormData({ ...formData, kilometers: value })}
          >
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="KILOMETERS*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10000">0 - 10,000 km</SelectItem>
              <SelectItem value="10000-50000">10,000 - 50,000 km</SelectItem>
              <SelectItem value="50000-100000">50,000 - 100,000 km</SelectItem>
              <SelectItem value="100000+">100,000+ km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.bodyType} onValueChange={(value) => setFormData({ ...formData, bodyType: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="BODY TYPE*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="coupe">Coupe</SelectItem>
              <SelectItem value="wagon">Wagon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.insured} onValueChange={(value) => setFormData({ ...formData, insured: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="IS YOUR CAR INSURED IN RWANDA?*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={formData.technicalControl}
            onValueChange={(value) => setFormData({ ...formData, technicalControl: value })}
          >
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="TECHNICAL CONTROL*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="not-applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={formData.price} onValueChange={(value) => setFormData({ ...formData, price: value })}>
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="PRICE*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-5m">Under 5,000,000 RWF</SelectItem>
              <SelectItem value="5m-10m">5,000,000 - 10,000,000 RWF</SelectItem>
              <SelectItem value="10m-20m">10,000,000 - 20,000,000 RWF</SelectItem>
              <SelectItem value="20m+">20,000,000+ RWF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={formData.phoneNumber}
            onValueChange={(value) => setFormData({ ...formData, phoneNumber: value })}
          >
            <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
              <SelectValue placeholder="PHONE NUMBER*" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+250-xxx-xxx-xxx">+250 XXX XXX XXX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-6">
          <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CarDetailsForm
