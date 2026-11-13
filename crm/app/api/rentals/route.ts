import { collectionHandlers } from "@/lib/api";

const handlers = collectionHandlers("rentals");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const dynamic = "force-dynamic";
