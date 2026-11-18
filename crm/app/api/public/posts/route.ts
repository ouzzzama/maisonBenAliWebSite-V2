import { NextRequest, NextResponse } from "next/server";
import { listRows } from "@/lib/repo";

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
 * Blog public du site.
 *
 *   GET /api/public/posts               → articles publiés, triés
 *   GET /api/public/posts?slug=…        → un article (pour blog-details)
 *
 * Un brouillon du CRM n'apparaît jamais ici.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const rows = (await listRows("posts")).filter((row) => row.published === true);

  const items = rows
    .sort((a, b) => Number(a.sortOrder ?? 10) - Number(b.sortOrder ?? 10))
    .map((row: Row) => ({
      id: row.id,
      title: row.title ?? "",
      slug: row.slug ?? row.id,
      category: row.category ?? "Conseils",
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      coverUrl: row.coverUrl ?? "",
      readMinutes: Number(row.readMinutes ?? 5),
      year: Number(row.year ?? new Date().getFullYear()),
      sortOrder: Number(row.sortOrder ?? 10),
    }));

  const headers = { ...cors, "Cache-Control": "public, max-age=30" };

  if (slug) {
    const one = items.find((item) => item.slug === slug) ?? null;
    return NextResponse.json(one, { status: one ? 200 : 404, headers });
  }

  return NextResponse.json(items, { headers });
}
