import { BookingsView } from "@/components/bookings/bookings-view";
import { listRows } from "@/lib/repo";
import type { Booking } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = (await listRows("bookings")) as unknown as Booking[];
  return <BookingsView initial={bookings} />;
}
