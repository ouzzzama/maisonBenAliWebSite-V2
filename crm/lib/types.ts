export type Row = Record<string, unknown> & { id: string };

export type CollectionName =
  | "leads"
  | "clients"
  | "bookings"
  | "rentals"
  | "projects"
  | "products"
  | "shop"
  | "marketplaces"
  | "posts"
  | "transactions"
  | "media"
  | "emails"
  | "vehicles";
