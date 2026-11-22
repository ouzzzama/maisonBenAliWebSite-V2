import { NextRequest, NextResponse } from "next/server";
import { listRows } from "@/lib/repo";
import { normalizeCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

/** The public website is the only allowed caller (set WEBSITE_ORIGIN in prod). */
const ALLOWED_ORIGIN = process.env.WEBSITE_ORIGIN ?? "*";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

type Row = Record<string, unknown> & { id: string };

/**
 * Catalogue public du site.
 *
 *   GET /api/public/products               → biens publiés, triés
 *   GET /api/public/products?slug=villa-…  → une fiche (pour project-details)
 *
 * Seuls les biens avec `published: true` sortent d'ici : un brouillon du CRM
 * n'apparaît jamais sur le site.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const rows = (await listRows("products")).filter((row) => row.published === true);

  const items = rows
    .sort((a, b) => Number(a.sortOrder ?? 10) - Number(b.sortOrder ?? 10))
    .map((row: Row) => ({
      id: row.id,
      title: row.title ?? "",
      slug: row.slug ?? row.id,
      category: normalizeCategory(row.category as string) || "appartement",
      deal: row.deal === "location" ? "location" : "vente",
      location: row.location ?? "",
      address: row.address ?? "",
      price: row.price === null || row.price === undefined ? null : Number(row.price),
      surface: row.surface ?? null,
      rooms: row.rooms ?? null,
      baths: row.baths ?? null,
      description: row.description ?? "",
      coverUrl: row.coverUrl ?? "",
      gallery: Array.isArray(row.gallery) ? row.gallery : [],
      badge: row.badge ?? "",
      sortOrder: Number(row.sortOrder ?? 10),
    }));

  const headers = { ...cors, "Cache-Control": "public, max-age=30" };

  if (slug) {
    const one = items.find((item) => item.slug === slug) ?? null;
    return NextResponse.json(one, { status: one ? 200 : 404, headers });
  }

  return NextResponse.json(items, { headers });
}
