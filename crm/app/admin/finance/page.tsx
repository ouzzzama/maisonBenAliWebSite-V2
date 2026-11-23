import { FinanceView } from "@/components/finance/finance-view";
import { listRows } from "@/lib/repo";
import type { MarketplaceListing, Transaction } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [transactions, marketplaces] = await Promise.all([
    listRows("transactions"),
    listRows("marketplaces"),
  ]);
  return (
    <FinanceView
      initial={transactions as unknown as Transaction[]}
      listings={marketplaces as unknown as MarketplaceListing[]}
    />
  );
}
