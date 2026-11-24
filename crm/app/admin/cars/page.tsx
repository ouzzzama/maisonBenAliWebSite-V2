import { CarsView } from "@/components/cars/cars-view";
import { FleetPricing } from "@/components/cars/fleet-pricing";
import { listRows } from "@/lib/repo";
import type { CarRental, Vehicle } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const [rentals, vehicles] = await Promise.all([
    listRows("rentals") as unknown as Promise<CarRental[]>,
    listRows("vehicles") as unknown as Promise<Vehicle[]>,
  ]);
  return (
    <div className="grid gap-6">
      <FleetPricing initial={vehicles} />
      <CarsView initial={rentals} />
    </div>
  );
}
