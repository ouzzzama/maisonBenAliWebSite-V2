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

const rate = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

/**
 * Grille tarifaire publique de la flotte.
 *
 *   GET /api/public/cars → véhicules publiés + tarifs jour / semaine / haute saison
 *
 * Un tarif absent sort en `null` : le site affiche alors « Tarif sur demande »
 * au lieu d'inventer un prix.
 */
export async function GET() {
  const rows = (await listRows("vehicles")).filter((row) => row.published !== false);

  const items = rows
    .sort((a, b) => Number(a.sortOrder ?? 10) - Number(b.sortOrder ?? 10))
    .map((row: Row) => ({
      id: row.id,
      slug: row.slug ?? row.id,
      name: row.name ?? "",
      category: row.category ?? "",
      badge: row.badge ?? "",
      tagline: row.tagline ?? "",
      description: row.description ?? "",
      image: row.image ?? "",
      alt: row.alt ?? "",
      dailyRate: rate(row.dailyRate),
      weeklyRate: rate(row.weeklyRate),
      highSeasonRate: rate(row.highSeasonRate),
      seasonNote: row.seasonNote ?? "",
      deposit: rate(row.deposit),
      sortOrder: Number(row.sortOrder ?? 10),
    }));

  return NextResponse.json(
    { updatedAt: new Date().toISOString(), cars: items },
    { headers: { ...cors, "Cache-Control": "public, max-age=60" } }
  );
}
