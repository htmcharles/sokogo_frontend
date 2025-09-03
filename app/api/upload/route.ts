import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Use req.json() because frontend sends JSON, not formData
    const files: { name: string }[] = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Generate unique file names for Vercel Blob
    const urls = files.map((file) => {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;

      // Return the file name that will be used for upload
      // The frontend will use the Vercel Blob client directly
      return {
        fileName: fileName,
        url: `/api/upload-file?filename=${encodeURIComponent(fileName)}`, // Endpoint to handle actual file upload
      };
    });

    return NextResponse.json({ urls });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
