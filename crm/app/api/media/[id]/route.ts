import { itemHandlers } from "@/lib/api";

const handlers = itemHandlers("media");

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const dynamic = "force-dynamic";
