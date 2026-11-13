import { collectionHandlers } from "@/lib/api";

const handlers = collectionHandlers("projects");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const dynamic = "force-dynamic";
