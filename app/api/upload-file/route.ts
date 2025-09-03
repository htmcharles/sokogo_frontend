import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = req.nextUrl.searchParams.get("filename");

    if (!file || !filename) {
      return NextResponse.json({ error: "File and filename are required" }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const { url } = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: url,
      message: "File uploaded successfully"
    });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({
      error: err?.message || "Failed to upload file"
    }, { status: 500 });
  }
}
