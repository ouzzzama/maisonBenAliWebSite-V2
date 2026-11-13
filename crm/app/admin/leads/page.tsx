import { LeadsView } from "@/components/leads/leads-view";
import { listRows } from "@/lib/repo";
import type { Lead } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = (await listRows("leads")) as unknown as Lead[];
  return <LeadsView initial={leads} />;
}
