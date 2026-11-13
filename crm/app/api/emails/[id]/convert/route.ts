import { NextRequest, NextResponse } from "next/server";
import { emailToLead } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lead = await emailToLead(id);
  return lead
    ? NextResponse.json(lead, { status: 201 })
    : NextResponse.json({ error: "Message introuvable" }, { status: 404 });
}
