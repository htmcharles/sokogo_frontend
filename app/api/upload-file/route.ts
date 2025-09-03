import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = req.nextUrl.searchParams.get("filename");

    if (!file || !filename) {
      return NextResponse.json(
        { error: "File and filename are required" },
        { status: 400 }
      );
    }

    // Always add a timestamp to avoid conflicts
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${filename}`;

    // Upload file to Vercel Blob
    const { url } = await put(uniqueFilename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: (file as any)?.type || undefined,
    });

    return NextResponse.json({
      success: true,
      url,
      filename: uniqueFilename,
      message: "File uploaded successfully",
    });
  } catch (err: any) {
    const message: string = err?.message || "Failed to upload file";
    console.error("File upload error:", err);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
