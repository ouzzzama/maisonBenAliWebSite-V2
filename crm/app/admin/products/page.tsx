import { ProductsView } from "@/components/products/products-view";
import { listRows } from "@/lib/repo";
import type { Product } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string }>;
}) {
  const [products, params] = await Promise.all([
    listRows("products") as unknown as Promise<Product[]>,
    searchParams,
  ]);
  const deal = params.deal === "location" ? "location" : params.deal === "vente" ? "vente" : "";
  return <ProductsView initial={products} initialDeal={deal} />;
}
