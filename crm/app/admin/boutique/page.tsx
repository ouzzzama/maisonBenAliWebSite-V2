import { ShopView } from "@/components/shop/shop-view";
import { listRows } from "@/lib/repo";
import type { ShopItem } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ShopAdminPage() {
  const items = (await listRows("shop")) as unknown as ShopItem[];
  return <ShopView initial={items} />;
}
