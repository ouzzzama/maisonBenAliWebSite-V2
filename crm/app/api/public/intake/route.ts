import { NextRequest, NextResponse } from "next/server";
import { createRow, newId } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** The public website is the only allowed caller (set WEBSITE_ORIGIN in prod). */
const ALLOWED_ORIGIN = process.env.WEBSITE_ORIGIN ?? "*";

function cors(origin = ALLOWED_ORIGIN) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Intake-Key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

type IntakePayload = Record<string, unknown>;

const str = (value: unknown, max = 400): string =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "";

const digits = (value: string) => value.replace(/\D/g, "");

/**
 * Public intake endpoint used by maisonbenali.com forms.
 *
 *   POST /api/public/intake
 *   { type: "bien" | "car" | "contact", name, phone, email, date, car,
 *     from, to, message, property, page }
 *
 * Every request becomes a Lead; visit / rental requests also create a Booking
 * (and a CarRental request when the vehicle and dates are known).
 */
export async function POST(request: NextRequest) {
  const key = process.env.WEBSITE_INTAKE_KEY;
  if (key && request.headers.get("x-intake-key") !== key) {
    return NextResponse.json({ ok: false, error: "Clé d'intake invalide" }, { status: 401, headers: cors() });
  }

  let body: IntakePayload;
  try {
    body = (await request.json()) as IntakePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Payload illisible" }, { status: 400, headers: cors() });
  }

  const phone = str(body.phone, 32);
  const email = str(body.email, 160);
  const name = str(body.name, 120) || "Contact site web";

  if (digits(phone).length < 6 && !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Téléphone ou e-mail requis" },
      { status: 400, headers: cors() }
    );
  }

  const type = str(body.type, 16) || "bien";
  const property = str(body.property, 120);
  const car = str(body.car, 60);
  const message = str(body.message, 2000);
  const page = str(body.page, 160);
  const visitDate = str(body.date, 24);
  const from = str(body.from, 24);
  const to = str(body.to, 24);
  const now = new Date().toISOString();

  const lead = await createRow("leads", {
    id: newId("ld"),
    fullName: name,
    email: email || null,
    phone: phone || null,
    company: null,
    status: "NEW",
    interest: type === "car" ? "CARS" : type === "contact" ? "PROJET" : "ACHAT",
    source: "Site web",
    budget: null,
    notes: [property, car && `Véhicule : ${car}`, message, page && `Page : ${page}`]
      .filter(Boolean)
      .join("\n"),
    tags: [type === "car" ? "Benali Cars" : type === "contact" ? "Contact" : "Visite"],
    createdAt: now,
  });

  let bookingId: string | null = null;
  let rentalId: string | null = null;

  if (type === "car" && (from || to)) {
    const pickupAt = from || now.slice(0, 10);
    const dropoffAt = to || pickupAt;
    const days = Math.max(
      1,
      Math.ceil((new Date(dropoffAt).getTime() - new Date(pickupAt).getTime()) / 86_400_000)
    );
    const rental = await createRow("rentals", {
      id: newId("cr"),
      reference: `CR-${Math.floor(1200 + Math.random() * 700)}`,
      vehicle: car || "Véhicule à confirmer",
      vehiclePlate: null,
      clientName: name,
      clientEmail: email || null,
      clientPhone: phone || null,
      pickupAt: new Date(pickupAt).toISOString(),
      dropoffAt: new Date(dropoffAt).toISOString(),
      pickupLocation: "Agadir — à confirmer",
      dailyRate: 0,
      totalPrice: null,
      deposit: null,
      depositPaid: false,
      agreementSigned: false,
      driverName: name,
      driverLicense: null,
      notes: `Demande site web (${days} j)${message ? ` — ${message}` : ""}`,
      status: "RESERVED",
      clientId: null,
    });
    rentalId = rental.id;
  } else if (visitDate || type === "bien") {
    const startsAt = visitDate ? new Date(visitDate).toISOString() : now;
    const booking = await createRow("bookings", {
      id: newId("bk"),
      reference: `BK-${Math.floor(2500 + Math.random() * 400)}`,
      clientName: name,
      clientEmail: email || null,
      clientPhone: phone || null,
      serviceType: property ? `Visite — ${property}` : "Demande de visite (site web)",
      startsAt,
      endsAt: null,
      status: "PENDING",
      price: null,
      notes: [message, page && `Page : ${page}`].filter(Boolean).join("\n"),
      clientId: null,
    });
    bookingId = booking.id;
  }

  return NextResponse.json(
    { ok: true, id: lead.id, bookingId, rentalId },
    { status: 201, headers: cors() }
  );
}
