import { NextRequest, NextResponse } from "next/server";
import { withDefaults } from "@/lib/api";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/repo";
import type { Row } from "@/lib/types";

/**
 * Annonces diffusées sur les portails (Airbnb, Mubawab, Avito, Hespress).
 *
 *   GET    /api/marketplaces             → toutes les annonces
 *   POST   /api/marketplaces             → crée une annonce
 *   PATCH  /api/marketplaces  { id, … }  → met à jour une annonce
 *   DELETE /api/marketplaces?id=…        → supprime une annonce
 */

export async function GET() {
  try {
    return NextResponse.json(await listRows("marketplaces"));
  } catch (error) {
    console.error("GET marketplaces failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Row;
    const created = await createRow("marketplaces", withDefaults("marketplaces", body));
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST marketplaces failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = (await request.json()) as Row & { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const updated = await updateRow("marketplaces", id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH marketplaces failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await deleteRow("marketplaces", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE marketplaces failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
