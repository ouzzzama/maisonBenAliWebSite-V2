import { StockView } from "@/components/stock/stock-view";
import { listRows } from "@/lib/repo";
import type { CarRental, Product } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function StockAdminPage() {
  const [products, rentals] = await Promise.all([
    listRows("products") as unknown as Promise<Product[]>,
    listRows("rentals") as unknown as Promise<CarRental[]>,
  ]);

  return <StockView products={products} rentals={rentals} />;
}
