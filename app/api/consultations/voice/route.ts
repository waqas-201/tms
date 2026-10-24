import { NextRequest, NextResponse } from "next/server";
import { BRAND } from "@/lib/brand-colors";
import fs from "fs";
import path from "path";

// Memory cache fallback for fast serving across route invocations
const memoryAudioStore = new Map<
  string,
  { buffer: Buffer; contentType: string; createdAt: number }
>();

// Ensure directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "voice");

function ensureDirectory() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create voice upload directory:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | Blob | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const id = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${id}.webm`;
    const contentType = file.type || "audio/webm";

    // Store in memory cache
    memoryAudioStore.set(id, {
      buffer,
      contentType,
      createdAt: Date.now(),
    });

    // Prune entries older than 48 hours to save memory
    if (memoryAudioStore.size > 200) {
      const now = Date.now();
      for (const [key, val] of memoryAudioStore.entries()) {
        if (now - val.createdAt > 48 * 60 * 60 * 1000) {
          memoryAudioStore.delete(key);
        }
      }
    }

    // Attempt to persist to public/uploads/voice
    try {
      ensureDirectory();
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      console.warn("Could not write audio to disk (running serverless):", fsErr);
    }

    // Determine host origin using DOMAIN from env
    const configuredDomain =
      process.env.DOMAIN ||
      process.env.NEXT_PUBLIC_APP_URL;

    let baseUrl = "";
    if (configuredDomain) {
      const clean = configuredDomain.trim().replace(/\/+$/, "");
      baseUrl = clean.startsWith("http") ? clean : `https://${clean}`;
    } else {
      const host =
        request.headers.get("x-forwarded-host") ||
        request.headers.get("host") ||
        "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }

    const audioUrl = `${baseUrl}/api/consultations/voice?id=${id}`;

    return NextResponse.json({
      success: true,
      id,
      audioUrl,
      directUrl: `/uploads/voice/${filename}`,
    });
  } catch (err: any) {
    console.error("Voice upload failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process voice note." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Voice ID is required." },
      { status: 400 }
    );
  }

  // 1. Check memory cache first
  const cached = memoryAudioStore.get(id);
  if (cached) {
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const rawParam = searchParams.get("raw");

    // If accessed directly in browser by human and not asking for raw audio stream
    if (acceptsHtml && rawParam !== "1") {
      return renderAudioHtmlPlayer(id);
    }

    return new Response(new Uint8Array(cached.buffer), {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Content-Length": cached.buffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // 2. Check disk
  const filePath = path.join(UPLOAD_DIR, `${id}.webm`);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const rawParam = searchParams.get("raw");

    if (acceptsHtml && rawParam !== "1") {
      return renderAudioHtmlPlayer(id);
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/webm",
        "Content-Length": fileBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return NextResponse.json(
    { success: false, error: "Voice note not found or expired." },
    { status: 404 }
  );
}

function renderAudioHtmlPlayer(id: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Patient Voice Note · Matab Tameer-e-Sehat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: ${BRAND.surface};
      color: ${BRAND.ink};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: ${BRAND.surfaceRaised};
      border: 1px solid ${BRAND.line};
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 30px ${BRAND.primaryA08};
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: ${BRAND.primarySoft};
      color: ${BRAND.primary};
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      color: ${BRAND.primary};
      font-weight: 800;
      margin-bottom: 6px;
    }
    p {
      font-size: 13px;
      color: ${BRAND.inkMuted};
      line-height: 1.5;
      margin-bottom: 24px;
    }
    audio {
      width: 100%;
      margin-bottom: 24px;
      outline: none;
      border-radius: 12px;
    }
    .clinic-tag {
      font-size: 11px;
      color: ${BRAND.secondaryText};
      font-weight: 600;
      border-top: 1px solid ${BRAND.surfaceSunken};
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🎙️ Patient Voice Note</div>
    <h1>Matab Tameer-e-Sehat</h1>
    <p>Voice consultation message for <strong>Hakeem Tahir Hameed</strong></p>
    <audio controls autoplay src="/api/consultations/voice?id=${id}&raw=1"></audio>
    <div class="clinic-tag">Classical Unani Clinic & Dispensary · Est. 1990 Karachi</div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
