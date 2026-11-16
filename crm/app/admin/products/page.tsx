import { ProductsView } from "@/components/products/products-view";
import { listRows } from "@/lib/repo";
import type { Product } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const products = (await listRows("products")) as unknown as Product[];
  return <ProductsView initial={products} />;
}
