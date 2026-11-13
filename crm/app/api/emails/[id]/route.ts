import { itemHandlers } from "@/lib/api";

const handlers = itemHandlers("emails");

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const dynamic = "force-dynamic";
