import { NextRequest, NextResponse } from "next/server";
import { listRows } from "@/lib/repo";

export const dynamic = "force-dynamic";

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

/**
 * CMS feed for the public website.
 *
 *   GET /api/public/media                → all active assets by slot
 *   GET /api/public/media?slot=HOME_HERO → a single slot, ordered
 *
 * The website's `assets/js/crm-media.js` swaps any element carrying
 * `data-cms-slot="HOME_HERO"` with the asset returned here.
 */
export async function GET(request: NextRequest) {
  const slot = request.nextUrl.searchParams.get("slot");
  const assets = await listRows("media");

  const active = assets
    .filter((asset) => asset.active !== false)
    .filter((asset) => (slot ? asset.pageSlot === slot : true))
    .sort((a, b) => Number(a.sortOrder ?? 1) - Number(b.sortOrder ?? 1))
    .map((asset) => ({
      id: asset.id,
      url: asset.url,
      alt: asset.alt ?? "",
      pageSlot: asset.pageSlot,
      sectionKey: asset.sectionKey ?? null,
      width: asset.width ?? null,
      height: asset.height ?? null,
      sortOrder: asset.sortOrder ?? 1,
    }));

  return NextResponse.json(active, {
    headers: { ...cors, "Cache-Control": "public, max-age=30" },
  });
}
