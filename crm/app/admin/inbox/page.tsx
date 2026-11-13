import { InboxView } from "@/components/inbox/inbox-view";
import { listRows } from "@/lib/repo";
import type { EmailMessage } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const emails = (await listRows("emails")) as unknown as EmailMessage[];
  return <InboxView initial={emails} />;
}
