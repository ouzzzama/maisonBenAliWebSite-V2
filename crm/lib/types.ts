export type Row = Record<string, unknown> & { id: string };

export type CollectionName =
  | "leads"
  | "clients"
  | "bookings"
  | "rentals"
  | "projects"
  | "products"
  | "shop"
  | "posts"
  | "transactions"
  | "media"
  | "emails";
