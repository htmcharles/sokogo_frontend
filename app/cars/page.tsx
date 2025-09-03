"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import { selectOptions } from "@/data/selectOptions"

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

  const renderSelect = (value: string, onChange: (val: string) => void, placeholder: string, options: { value: string, label: string }[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-12 rounded-full border-gray-300">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

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
        <Link href="/seller">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to Seller
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderSelect(formData.location, val => setFormData({ ...formData, location: val }), "NYARUGENGE", selectOptions.locations)}
        {renderSelect(formData.makeModel, val => setFormData({ ...formData, makeModel: val }), "MAKE & MODEL*", selectOptions.makeModels)}
        {renderSelect(formData.year, val => setFormData({ ...formData, year: val }), "YEAR*", selectOptions.years)}
        <Input
          type="number"
          value={formData.kilometers}
          onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
          placeholder="KILOMETERS*"
          className="w-full h-12 rounded-full"
          min={0}
          inputMode="numeric"
        />
        {renderSelect(formData.bodyType, val => setFormData({ ...formData, bodyType: val }), "BODY TYPE*", selectOptions.bodyTypes)}
        {renderSelect(formData.insured, val => setFormData({ ...formData, insured: val }), "IS YOUR CAR INSURED IN RWANDA?*", selectOptions.insuredOptions)}
        {renderSelect(formData.technicalControl, val => setFormData({ ...formData, technicalControl: val }), "TECHNICAL CONTROL*", selectOptions.technicalControls)}
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="PRICE*"
          className="w-full h-12 rounded-full"
          min={0}
          step="1"
          inputMode="numeric"
        />
        <Input
          type="number"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="PHONE NUMBER*"
          className="w-full h-12 rounded-full"
          inputMode="numeric"
        />

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
