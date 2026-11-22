import { NextRequest, NextResponse } from "next/server";
import { withDefaults } from "@/lib/api";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/repo";
import type { Row } from "@/lib/types";
import { normalizeCategory } from "@/lib/categories";

/** Les biens enregistrés avant les nouvelles catégories gardent un slug lisible. */
function withCategory(row: Row): Row {
  const category = normalizeCategory(row.category as string | null);
  return category ? { ...row, category } : row;
}

/**
 * Catalogue des biens (partie 1 du module).
 *
 *   GET    /api/products                → tous les biens (brouillons inclus)
 *   POST   /api/products                → crée un bien
 *   PATCH  /api/products  { id, ... }   → met à jour un bien
 *   DELETE /api/products?id=…           → supprime un bien
 *
 * Les biens marqués `published` sont servis au site public par
 * /api/public/products (liste + fiche `project-details`).
 */

export async function GET() {
  try {
    const rows = await listRows("products");
    return NextResponse.json(rows.map(withCategory));
  } catch (error) {
    console.error("GET products failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Row;
    const category = normalizeCategory(body.category as string | null);
    const created = await createRow(
      "products",
      withDefaults("products", category ? { ...body, category } : body)
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST products failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = (await request.json()) as Row & { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const category = normalizeCategory(updates.category as string | null);
    if (category) updates.category = category;
    const updated = await updateRow("products", id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH products failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await deleteRow("products", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE products failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
