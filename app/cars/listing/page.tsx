"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function AddListingPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const router = useRouter()

  // ---- Upload to Vercel Blob ----
  const uploadToBlob = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error("Upload failed")
    const data = await res.json()
    return data.url as string
  }

  // ---- Handle Form Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrls: string[] = []

    if (selectedFiles.length > 0) {
      try {
        setIsUploading(true)
        const uploadPromises = selectedFiles.map((file) => uploadToBlob(file))
        imageUrls = await Promise.all(uploadPromises)
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err.message,
        })
        return
      } finally {
        setIsUploading(false)
      }
    }

    // Build payload
    const payload = {
      title,
      description,
      images: imageUrls,
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save listing")

      toast({ title: "Listing created successfully!" })
      router.push("/listings")
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Add New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Describe your car"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
          }
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  )
}
