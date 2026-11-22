import { MarketplacesView } from "@/components/marketplaces/marketplaces-view";
import { listRows } from "@/lib/repo";
import type { MarketplaceListing, Product } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function MarketplacesPage() {
  const [listings, products] = await Promise.all([
    listRows("marketplaces") as unknown as Promise<MarketplaceListing[]>,
    listRows("products") as unknown as Promise<Product[]>,
  ]);

  return <MarketplacesView initial={listings} products={products} />;
}
