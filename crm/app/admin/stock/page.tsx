import { StockView } from "@/components/stock/stock-view";
import { listRows } from "@/lib/repo";
import type { CarRental, MarketplaceListing, Product } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function StockAdminPage() {
  const [products, rentals, marketplaces] = await Promise.all([
    listRows("products") as unknown as Promise<Product[]>,
    listRows("rentals") as unknown as Promise<CarRental[]>,
    listRows("marketplaces") as unknown as Promise<MarketplaceListing[]>,
  ]);

  return <StockView products={products} rentals={rentals} marketplaces={marketplaces} />;
}
