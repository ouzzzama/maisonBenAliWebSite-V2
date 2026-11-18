import { NextRequest, NextResponse } from "next/server";
import { withDefaults } from "@/lib/api";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/repo";
import type { Row } from "@/lib/types";

/**
 * Articles du blog (partie rédaction du module).
 *
 *   GET    /api/posts                → tous les articles (brouillons inclus)
 *   POST   /api/posts                → crée un article
 *   PATCH  /api/posts  { id, ... }   → met à jour un article
 *   DELETE /api/posts?id=…           → supprime un article
 *
 * Les articles `published` sont servis au site par /api/public/posts
 * (page blog.html et fiche blog-details.html).
 */

export async function GET() {
  try {
    return NextResponse.json(await listRows("posts"));
  } catch (error) {
    console.error("GET posts failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Row;
    const created = await createRow("posts", withDefaults("posts", body));
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST posts failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = (await request.json()) as Row & { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const updated = await updateRow("posts", id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH posts failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await deleteRow("posts", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE posts failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
