import { CarsView } from "@/components/cars/cars-view";
import { listRows } from "@/lib/repo";
import type { CarRental } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const rentals = (await listRows("rentals")) as unknown as CarRental[];
  return <CarsView initial={rentals} />;
}
