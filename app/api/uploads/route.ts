import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files uploaded", imagePaths: [] }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const savedPaths: string[] = []

    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name) || ".jpg"
      const base = path.basename(file.name, ext)
      const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_")
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeBase}${ext}`
      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, bytes)
      // Publicly accessible path
      savedPaths.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ message: "Uploaded locally", imagePaths: savedPaths }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Upload failed" }, { status: 500 })
  }
}
