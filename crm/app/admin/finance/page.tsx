import { FinanceView } from "@/components/finance/finance-view";
import { listRows } from "@/lib/repo";
import type { Transaction } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const transactions = (await listRows("transactions")) as unknown as Transaction[];
  return <FinanceView initial={transactions} />;
}
