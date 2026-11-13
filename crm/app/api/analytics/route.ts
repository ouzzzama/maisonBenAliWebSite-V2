import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAnalytics());
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
