import { NextRequest, NextResponse } from "next/server";
import { withDefaults } from "@/lib/api";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/repo";
import type { Row } from "@/lib/types";

/**
 * Flotte Benali Cars et grille tarifaire (source des prix du site public).
 *
 *   GET    /api/vehicles                → tous les véhicules
 *   POST   /api/vehicles                → ajoute un véhicule
 *   PATCH  /api/vehicles  { id, ... }   → met à jour tarifs / publication
 *   DELETE /api/vehicles?id=…           → retire un véhicule
 *
 * Les véhicules `published` sortent sur le site via /api/public/cars.
 */

export async function GET() {
  try {
    const rows = await listRows("vehicles");
    const sorted = rows.sort(
      (a, b) => Number(a.sortOrder ?? 10) - Number(b.sortOrder ?? 10) || String(a.name).localeCompare(String(b.name))
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET vehicles failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Row;
    const created = await createRow("vehicles", withDefaults("vehicles", body));
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST vehicles failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = (await request.json()) as Row & { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const updated = await updateRow("vehicles", id, updates);
    if (!updated) return NextResponse.json({ error: "véhicule inconnu" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH vehicles failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await deleteRow("vehicles", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE vehicles failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
