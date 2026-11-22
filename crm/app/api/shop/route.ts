import { NextRequest, NextResponse } from "next/server";
import { withDefaults } from "@/lib/api";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/repo";
import type { Row } from "@/lib/types";

/**
 * Boutique : matériel et équipements vendus ou loués.
 *
 *   GET    /api/shop                 → tous les articles (brouillons inclus)
 *   POST   /api/shop                 → crée un article
 *   PATCH  /api/shop   { id, ... }   → met à jour un article
 *   DELETE /api/shop?id=…            → supprime un article
 */

export async function GET() {
  try {
    return NextResponse.json(await listRows("shop"));
  } catch (error) {
    console.error("GET shop failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Row;
    const created = await createRow("shop", withDefaults("shop", body));
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST shop failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = (await request.json()) as Row & { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const updated = await updateRow("shop", id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH shop failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await deleteRow("shop", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE shop failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
