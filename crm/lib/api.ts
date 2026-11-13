import { NextRequest, NextResponse } from "next/server";
import { CollectionName } from "./types";
import {
  createRow,
  deleteRow,
  getRow,
  listRows,
  newId,
  updateRow,
} from "./repo";
import type { Row } from "./types";

const PREFIX: Record<CollectionName, string> = {
  leads: "ld",
  clients: "cl",
  bookings: "bk",
  rentals: "cr",
  projects: "pr",
  transactions: "tx",
  media: "md",
  emails: "em",
};

const now = () => new Date().toISOString();

/** Adds the ids / references a new row needs when the form omits them. */
function withDefaults(collection: CollectionName, body: Row): Row {
  const row: Row = { ...body, id: body.id ?? newId(PREFIX[collection]) };
  if (collection === "bookings") row.reference ??= `BK-${Math.floor(2400 + Math.random() * 500)}`;
  if (collection === "rentals") row.reference ??= `CR-${Math.floor(1180 + Math.random() * 300)}`;
  if (collection === "transactions") row.reference ??= `TX-${Math.floor(9850 + Math.random() * 400)}`;
  if (collection === "projects" && !row.slug) {
    row.slug = String(row.title ?? "projet")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (collection === "media") {
    row.pageSlot ??= "OTHER";
    row.sortOrder ??= 1;
    row.active ??= true;
    row.mimeType ??= "image/jpeg";
    row.filename ??= String(row.url ?? "image.jpg").split("/").pop();
  }
  row.createdAt ??= now();
  return row;
}

export function collectionHandlers(collection: CollectionName) {
  return {
    GET: async () => {
      try {
        return NextResponse.json(await listRows(collection));
      } catch (error) {
        return NextResponse.json(
          { error: "Lecture impossible", detail: String(error) },
          { status: 500 }
        );
      }
    },
    POST: async (request: NextRequest) => {
      try {
        const body = (await request.json()) as Row;
        const created = await createRow(collection, withDefaults(collection, body));
        return NextResponse.json(created, { status: 201 });
      } catch (error) {
        return NextResponse.json(
          { error: "Création impossible", detail: String(error) },
          { status: 400 }
        );
      }
    },
  };
}

type Context = { params: Promise<{ id: string }> };

export function itemHandlers(collection: CollectionName) {
  return {
    GET: async (_request: NextRequest, context: Context) => {
      const { id } = await context.params;
      const row = await getRow(collection, id);
      return row
        ? NextResponse.json(row)
        : NextResponse.json({ error: "Introuvable" }, { status: 404 });
    },
    PATCH: async (request: NextRequest, context: Context) => {
      try {
        const { id } = await context.params;
        const body = (await request.json()) as Row;
        const updated = await updateRow(collection, id, body);
        return updated
          ? NextResponse.json(updated)
          : NextResponse.json({ error: "Introuvable" }, { status: 404 });
      } catch (error) {
        return NextResponse.json(
          { error: "Mise à jour impossible", detail: String(error) },
          { status: 400 }
        );
      }
    },
    DELETE: async (_request: NextRequest, context: Context) => {
      const { id } = await context.params;
      const ok = await deleteRow(collection, id);
      return ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "Introuvable" }, { status: 404 });
    },
  };
}
