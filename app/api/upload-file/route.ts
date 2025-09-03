import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = req.nextUrl.searchParams.get("filename");
    const overwrite = req.nextUrl.searchParams.get("overwrite") === "true";

    if (!file || !filename) {
      return NextResponse.json({ error: "File and filename are required" }, { status: 400 });
    }

    // Optionally delete existing blob first to guarantee overwrite semantics
    if (overwrite) {
      try {
        await del(filename);
      } catch (e: any) {
        // Ignore not-found; surface other errors
        const message = e?.message || "";
        if (!message.toLowerCase().includes("not found")) {
          throw e;
        }
      }
    }

    // Upload file to Vercel Blob
    const { url } = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: (file as any)?.type || undefined,
    });

    return NextResponse.json({
      success: true,
      url: url,
      message: "File uploaded successfully"
    });
  } catch (err: any) {
    const message: string = err?.message || "Failed to upload file";
    const isConflict = /already exists|conflict|409/.test(message.toLowerCase());
    const status = isConflict ? 409 : 500;
    if (status === 500) {
      console.error("File upload error:", err);
    }
    return NextResponse.json({
      error: message,
      hint: isConflict ? "Pass overwrite=true to replace existing blob or use a unique filename." : undefined,
    }, { status });
  }
}
