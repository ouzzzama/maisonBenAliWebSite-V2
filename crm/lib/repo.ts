import type { CollectionName } from "./types";
import { demoData } from "./demo-data";

/**
 * Data access layer.
 *
 * When `DATABASE_URL` is set the rows are read from / written to the Prisma
 * schema (see `prisma/schema.prisma`). Without a database the module keeps the
 * seeded Maison Ben Ali dataset in memory so the whole admin stays functional.
 */

type PrismaModel = {
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  findUnique: (args: { where: { id: string } }) => Promise<unknown | null>;
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

type PrismaClient = Record<string, PrismaModel>;

type Row = Record<string, unknown> & { id: string };
type RowInput = Record<string, unknown>;
type PrismaRow = Record<string, unknown>;

const cache = globalThis as {
  __crmPrisma?: PrismaClient;
  __crmStore?: Record<CollectionName, Row[]>;
};

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (cache.__crmPrisma) return cache.__crmPrisma;
  try {
    const mod = require("@prisma/client") as { PrismaClient: new () => any };
    cache.__crmPrisma = new mod.PrismaClient() as PrismaClient;
    return cache.__crmPrisma;
  } catch {
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

export const isDatabaseConnected = () => !!cache.__crmPrisma;

const MODEL: Record<CollectionName, string> = demoData.scope as Record<CollectionName, string>;

function serialize(row: PrismaRow): Row {
  const out: PrismaRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) out[key] = value.toISOString();
    else if (value && typeof value === "object" && "toNumber" in value) out[key] = Number(value.valueOf());
    else out[key] = value;
  }
  return out as Row;
}

const DATE_FIELDS = ["createdAt", "updatedAt", "receivedAt", "startsAt", "endsAt", "pickupAt", "dropoffAt", "occurredAt"];
const DECIMAL_FIELDS = ["budget", "price", "dailyRate", "totalPrice", "deposit", "amount"];

function prepare(data: RowInput): PrismaRow {
  const out: PrismaRow = { ...data };
  for (const field of DATE_FIELDS) {
    const value = out[field];
    if (typeof value === "string" && value) out[field] = new Date(value);
    if (!value) out[field] = undefined;
  }
  for (const field of DECIMAL_FIELDS) {
    const value = out[field];
    if (value === "" || value === undefined || value === null) out[field] = undefined;
    else if (typeof value === "number" && Number.isFinite(value)) out[field] = value;
  }
  return out;
}

function store(): Record<CollectionName, Row[]> {
  if (!cache.__crmStore) {
    cache.__crmStore = {
      leads: [...demoData.leads] as unknown as Row[],
      clients: [...demoData.clients] as unknown as Row[],
      bookings: [...demoData.bookings] as unknown as Row[],
      rentals: [...demoData.rentals] as unknown as Row[],
      projects: [...demoData.projects] as unknown as Row[],
      transactions: [...demoData.transactions] as unknown as Row[],
      media: [...demoData.media] as unknown as Row[],
      emails: [...demoData.emails] as unknown as Row[],
    };
  }
  return cache.__crmStore;
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export async function listRows(collection: CollectionName): Promise<Row[]> {
  const prisma = getPrisma();
  if (prisma) {
    const rows = (await prisma[MODEL[collection]].findMany()) as PrismaRow[];
    return rows.map(serialize);
  }
  const list = store()[collection] ?? [];
  return [...list].sort((a, b) => {
    const ad = String(a.createdAt ?? a.occurredAt ?? a.receivedAt ?? "");
    const bd = String(b.createdAt ?? b.occurredAt ?? b.receivedAt ?? "");
    return bd.localeCompare(ad);
  });
}

export async function getRow(collection: CollectionName, id: string): Promise<Row | null> {
  const prisma = getPrisma();
  if (prisma) {
    const row = (await prisma[MODEL[collection]].findUnique({ where: { id } })) as PrismaRow | null;
    return row ? serialize(row) : null;
  }
  return (store()[collection] ?? []).find((row) => row.id === id) ?? null;
}

export async function createRow(collection: CollectionName, data: RowInput): Promise<Row> {
  const prisma = getPrisma();
  if (prisma) {
    const row = (await prisma[MODEL[collection]].create({ data: prepare(data) })) as PrismaRow;
    return serialize(row);
  }
  const row = { id: newId(`${collection.slice(0, 2)}_`), ...data } as Row;
  const list = store()[collection] ?? [];
  list.unshift(row);
  store()[collection] = list;
  return row;
}

export async function updateRow(collection: CollectionName, id: string, data: RowInput): Promise<Row | null> {
  const prisma = getPrisma();
  if (prisma) {
    const row = (await prisma[MODEL[collection]].update({ where: { id }, data: prepare(data) })) as PrismaRow;
    return serialize(row);
  }
  const list = store()[collection] ?? [];
  const index = list.findIndex((row) => row.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...data, id };
  store()[collection] = list;
  return list[index];
}

export async function deleteRow(collection: CollectionName, id: string): Promise<boolean> {
  const prisma = getPrisma();
  if (prisma) {
    await prisma[MODEL[collection]].delete({ where: { id } });
  }
  const list = store()[collection] ?? [];
  const index = list.findIndex((row) => row.id === id);
  if (index === -1) return false;
  list.splice(index, 1);
  store()[collection] = list;
  return true;
}

export type Analytics = {
  kpis: {
    revenue: number;
    pending: number;
    overdue: number;
    leads: number;
    clients: number;
    conversion: number;
    activeRentals: number;
    upcomingBookings: number;
    occupancy: number;
  };
  monthly: { month: string; bookings: number; rentals: number; projects: number; total: number }[];
  streams: { name: string; value: number }[];
  leadFunnel: { status: string; count: number }[];
  recentTransactions: Row[];
  upcoming: Row[];
};

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export async function getAnalytics(): Promise<Analytics> {
  const [transactions, leads, clients, rentals, bookings] = await Promise.all([
    listRows("transactions"),
    listRows("leads"),
    listRows("clients"),
    listRows("rentals"),
    listRows("bookings"),
  ]);

  const paid = transactions.filter((t) => t.status === "PAID" && t.type !== "EXPENSE");
  const revenue = paid.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  const pending = transactions.filter((t) => t.status === "PENDING").reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  const overdue = transactions.filter((t) => t.status === "OVERDUE").reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

  const now = new Date();
  const monthly: Analytics["monthly"] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthly.push({ month: MONTHS[date.getMonth()], bookings: 0, rentals: 0, projects: 0, total: 0 });
  }
  for (const t of paid) {
    const date = new Date(String(t.occurredAt));
    const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (diff < 0 || diff > 5) continue;
    const amount = Number(t.amount ?? 0);
    const bucket = monthly[5 - diff];
    bucket.total += amount;
    if (t.stream === "booking") bucket.bookings += amount;
    else if (t.stream === "rental") bucket.rentals += amount;
    else bucket.projects += amount;
  }

  const streamTotals: Record<string, number> = { booking: 0, rental: 0, project: 0, other: 0 };
  for (const t of paid) {
    const stream = String(t.stream ?? "other");
    streamTotals[stream] = (streamTotals[stream] ?? 0) + Number(t.amount ?? 0);
  }

  const leadFunnel = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((status) => ({
    status,
    count: leads.filter((lead) => lead.status === status).length,
  }));

  const upcoming = bookings
    .filter((booking) => ["PENDING", "CONFIRMED"].includes(String(booking.status)))
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)))
    .slice(0, 5);

  return {
    kpis: {
      revenue,
      pending,
      overdue,
      leads: leads.length,
      clients: clients.length,
      conversion: leads.length ? Math.round((clients.length / leads.length) * 100) : 0,
      activeRentals: rentals.filter((rental) => ["ACTIVE", "RESERVED"].includes(String(rental.status))).length,
      upcomingBookings: upcoming.length,
      occupancy: rentals.length
        ? Math.round((rentals.filter((rental) => rental.status === "ACTIVE").length / rentals.length) * 100)
        : 0,
    },
    monthly,
    streams: [
      { name: "Réservations", value: streamTotals.booking },
      { name: "Benali Cars", value: streamTotals.rental },
      { name: "Projets", value: streamTotals.project },
      { name: "Autres", value: streamTotals.other },
    ],
    leadFunnel,
    recentTransactions: [...transactions]
      .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)))
      .slice(0, 6),
    upcoming,
  };
}

/** Converts an inbox message into a qualified lead and tags the thread. */
export async function emailToLead(id: string): Promise<Row | null> {
  const email = await getRow("emails", id);
  if (!email) return null;

  const lead = await createRow("leads", {
    id: newId("ld"),
    fullName: String(email.fromName ?? email.fromEmail ?? "Contact"),
    email: String(email.fromEmail ?? ""),
    phone: null,
    company: null,
    status: "NEW",
    interest: "ACHAT",
    source: "Email",
    budget: null,
    notes: String(email.subject ?? ""),
    tags: ["Inbox"],
    createdAt: new Date().toISOString(),
  });

  await updateRow("emails", id, { status: "CONVERTED", leadId: lead.id });
  return lead;
}
