import { NextRequest, NextResponse } from "next/server";
import { createRow, newId } from "@/lib/repo";

export const dynamic = "force-dynamic";

type InboundPayload = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === "string" ? value : "");

/** Extracts `Name <email>` / `email` forms used by Resend and SendGrid. */
function parseAddress(value: unknown): { name: string | null; email: string } {
  const raw = str(value).trim();
  const match = raw.match(/^(.*)<([^>]+)>$/);
  if (match) {
    const name = match[1].replace(/"/g, "").trim();
    return { name: name || null, email: match[2].trim() };
  }
  return { name: null, email: raw };
}

/**
 * Inbound email webhook (Resend `email.received`, SendGrid Inbound Parse, or a
 * plain JSON post). Every message is stored as an UNREAD thread in the CRM.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (secret) {
    const provided =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (provided !== secret) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }
  }

  let payload: InboundPayload;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    payload = contentType.includes("application/json")
      ? ((await request.json()) as InboundPayload)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return NextResponse.json({ error: "Payload illisible" }, { status: 400 });
  }

  // Resend wraps the message in `data`, SendGrid posts it at the root.
  const data = (payload.data as InboundPayload | undefined) ?? payload;
  const from = parseAddress(data.from ?? data.sender ?? payload.from);
  const subject = str(data.subject ?? payload.subject) || "(sans objet)";
  const body = str(data.text ?? data.body ?? data.html ?? payload.text ?? payload.body);
  const to = str(data.to ?? payload.to) || process.env.MAIL_FROM || "contact@maisonbenali.com";
  const threadKey = str(data.threadId ?? payload.threadId) || `thread-${from.email}-${subject}`.toLowerCase();

  if (!from.email) {
    return NextResponse.json({ error: "Expéditeur manquant" }, { status: 400 });
  }

  const row = await createRow("emails", {
    id: newId("em"),
    fromName: from.name,
    fromEmail: from.email,
    toEmail: to,
    subject,
    snippet: body.slice(0, 140),
    body: body || "(message vide)",
    status: "UNREAD",
    provider: payload.provider === "resend" || payload.type === "email.received" ? "resend" : "webhook",
    threadKey,
    isOutbound: false,
    receivedAt: new Date().toISOString(),
    leadId: null,
  });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
