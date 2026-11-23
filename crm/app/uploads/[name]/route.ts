import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { LOCAL_DIR } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/**
 * Sert les images stockées localement (mode développement, sans FTP Hostinger).
 * En production, ce sont les fichiers de public_html qui sont servis par le site.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  /* un seul segment, sans remontée de dossier */
  if (!/^[a-z0-9][a-z0-9-]*\.[a-z0-9]+$/i.test(name)) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(LOCAL_DIR, name));
    const ext = name.split(".").pop()?.toLowerCase() ?? "jpg";
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
}
