import { ClientsView } from "@/components/clients/clients-view";
import { listRows } from "@/lib/repo";
import type { Client } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, bookings] = await Promise.all([listRows("clients"), listRows("bookings")]);
  return (
    <ClientsView
      initial={clients as unknown as Client[]}
      bookings={bookings.map((booking) => ({ clientId: (booking.clientId as string) ?? null }))}
    />
  );
}
