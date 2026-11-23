import { NextRequest, NextResponse } from "next/server";
import { safeFileName, saveImage, storageInfo } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

/** Où partent les fichiers (Hostinger ou local) — sans jamais exposer le mot de passe. */
export async function GET() {
  return NextResponse.json(storageInfo());
}

/**
 * Envoi d'une image depuis le CRM.
 *
 *   POST /api/upload   (multipart/form-data, champ « file »)
 *   → { url: "https://maisonbenali.com/uploads/crm/villa-….webp", … }
 *
 * L'URL renvoyée est l'URL publique du fichier sur l'hébergement Hostinger :
 * elle s'affiche telle quelle sur le site et se colle dans n'importe quel champ
 * image du CRM.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Format non pris en charge (JPG, PNG, WebP, AVIF, GIF ou SVG)." },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image trop lourde (12 Mo maximum)." },
        { status: 413 }
      );
    }

    const filename = safeFileName(file.name, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveImage(filename, buffer, request.nextUrl.origin);

    return NextResponse.json(
      {
        url: stored.url,
        driver: stored.driver,
        filename,
        size: buffer.byteLength,
        mimeType: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Envoi impossible", detail: String(error) },
      { status: 500 }
    );
  }
}
