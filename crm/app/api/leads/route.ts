import { NextRequest, NextResponse } from "next/server";
import { listRows, createRow, updateRow, deleteRow } from "@/lib/repo";
import type { Row } from "@/lib/types";

export async function GET() {
  try {
    const rows = await listRows("leads");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET leads failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createRow("leads", body as Row);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST leads failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updated = await updateRow("leads", id, updates as Row);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH leads failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteRow("leads", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE leads failed:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
