"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { bookingSchema, type BookingInput } from "@/lib/validators";
import type { Booking } from "@/lib/demo-data";
import {
  BOOKING_STATUS_LABEL,
  cn,
  formatDateTime,
  formatMAD,
  toInputDateTime,
} from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const emptyBooking: BookingInput = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  serviceType: "",
  startsAt: toInputDateTime(),
  endsAt: "",
  status: "PENDING",
  price: undefined,
  notes: "",
};

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function BookingsView({ initial }: { initial: Booking[] }) {
  const bookings = useCollection<Booking>("/api/bookings", initial);
  const [view, setView] = React.useState<"table" | "calendar">("table");
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ status: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Booking | null>(null);
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const form = useForm<BookingInput>({
    resolver: zodForm(bookingSchema),
    defaultValues: emptyBooking,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyBooking);
    setOpen(true);
  };

  const openEdit = (booking: Booking) => {
    setEditing(booking);
    form.reset({
      clientName: booking.clientName,
      clientEmail: booking.clientEmail ?? "",
      clientPhone: booking.clientPhone ?? "",
      serviceType: booking.serviceType,
      startsAt: toInputDateTime(booking.startsAt),
      endsAt: booking.endsAt ? toInputDateTime(booking.endsAt) : "",
      status: booking.status,
      price: booking.price ?? undefined,
      notes: booking.notes ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: BookingInput) => {
    const payload = {
      ...values,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    };
    const result = editing
      ? await bookings.update(editing.id, payload)
      : await bookings.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyBooking);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return bookings.items.filter((booking) => {
      if (filters.status && booking.status !== filters.status) return false;
      if (!term) return true;
      return [booking.clientName, booking.serviceType, booking.reference, booking.clientEmail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [bookings.items, query, filters]);

  const calendarDays = React.useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < startOffset; i += 1) cells.push({ date: null });
    for (let day = 1; day <= daysInMonth; day += 1) cells.push({ date: new Date(year, month, day) });
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return cells;
  }, [cursor]);

  const bookingsOn = (date: Date) =>
    filtered.filter((booking) => {
      const start = new Date(booking.startsAt);
      return (
        start.getDate() === date.getDate() &&
        start.getMonth() === date.getMonth() &&
        start.getFullYear() === date.getFullYear()
      );
    });

  const columns: Column<Booking>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (booking) => (
        <span className="font-mono text-[11.5px] font-semibold text-ink/60">{booking.reference}</span>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (booking) => (
        <div>
          <p className="text-[13px] font-semibold text-ink">{booking.clientName}</p>
          <p className="text-[11px] text-muted">{booking.clientPhone ?? booking.clientEmail ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      cell: (booking) => <span className="text-[12.5px] text-ink/75">{booking.serviceType}</span>,
      hideOnMobile: true,
    },
    {
      key: "when",
      header: "Date & heure",
      cell: (booking) => (
        <span className="text-[12px] text-ink/70">{formatDateTime(booking.startsAt)}</span>
      ),
    },
    {
      key: "price",
      header: "Montant",
      cell: (booking) => (
        <span className="font-medium text-ink">{booking.price ? formatMAD(booking.price) : "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Statut",
      cell: (booking) => (
        <StatusBadge status={booking.status} label={BOOKING_STATUS_LABEL[booking.status]} />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (booking) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(booking)}
            title="Modifier"
            className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Supprimer la réservation ${booking.reference} ?`))
                bookings.remove(booking.id);
            }}
            title="Supprimer"
            className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Opérations"
        title="Réservations & rendez-vous"
        description="Visites, estimations, conciergerie : planning et suivi des statuts."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouvelle réservation
          </Button>
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex rounded-full border border-ink/10 bg-white p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
              view === "table" ? "bg-ink text-white" : "text-ink/55"
            )}
          >
            <LayoutList className="size-3.5" /> Tableau
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
              view === "calendar" ? "bg-ink text-white" : "text-ink/55"
            )}
          >
            <CalendarDays className="size-3.5" /> Calendrier
          </button>
        </div>
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Client, service, référence…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ status: "" });
        }}
        filters={[{ key: "status", label: "Statut", options: STATUS_OPTIONS }]}
      />

      {view === "table" ? (
        <DataTable
          rows={filtered}
          columns={columns}
          empty="Aucune réservation pour ces filtres."
          footer={
            <span>
              {filtered.length} réservation{filtered.length > 1 ? "s" : ""} ·{" "}
              {formatMAD(filtered.reduce((sum, booking) => sum + Number(booking.price ?? 0), 0))}{" "}
              de volume
            </span>
          }
        />
      ) : (
        <div className="rounded-3xl border border-ink/8 bg-white p-4 shadow-[0_2px_10px_rgba(18,43,67,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Mois précédent"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="grid size-8 place-items-center rounded-lg border border-ink/10 text-ink/60"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Mois suivant"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="grid size-8 place-items-center rounded-lg border border-ink/10 text-ink/60"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/40">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="px-1 pb-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => {
              const dayBookings = cell.date ? bookingsOn(cell.date) : [];
              const today = cell.date && new Date().toDateString() === cell.date.toDateString();
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[86px] rounded-xl border p-1.5",
                    cell.date ? "border-ink/8 bg-white" : "border-transparent bg-cream/40",
                    today && "border-coral/40 bg-coral/4"
                  )}
                >
                  {cell.date ? (
                    <>
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          today ? "text-coral" : "text-ink/50"
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayBookings.slice(0, 2).map((booking) => (
                          <button
                            key={booking.id}
                            type="button"
                            onClick={() => openEdit(booking)}
                            className="block w-full truncate rounded-md bg-ink/6 px-1.5 py-1 text-left text-[10px] font-medium text-ink/75 transition hover:bg-ink/12"
                          >
                            {booking.clientName.split(" ")[0]} ·{" "}
                            {new Date(booking.startsAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </button>
                        ))}
                        {dayBookings.length > 2 ? (
                          <span className="block px-1 text-[9.5px] text-ink/40">
                            +{dayBookings.length - 2}
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Réservation ${editing.reference}` : "Nouvelle réservation"}
        description="La réservation peut générer une transaction dans le module Finances."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Client</Label>
              <Input {...form.register("clientName")} />
              <FieldError>{form.formState.errors.clientName?.message}</FieldError>
            </div>
            <div>
              <Label>Service</Label>
              <Input {...form.register("serviceType")} placeholder="Visite, estimation, conciergerie…" />
              <FieldError>{form.formState.errors.serviceType?.message}</FieldError>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("clientEmail")} />
              <FieldError>{form.formState.errors.clientEmail?.message}</FieldError>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...form.register("clientPhone")} />
            </div>
            <div>
              <Label>Début</Label>
              <Input type="datetime-local" {...form.register("startsAt")} />
              <FieldError>{form.formState.errors.startsAt?.message}</FieldError>
            </div>
            <div>
              <Label>Fin (optionnel)</Label>
              <Input type="datetime-local" {...form.register("endsAt")} />
            </div>
            <div>
              <Label>Statut</Label>
              <Select {...form.register("status")}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Montant (MAD)</Label>
              <Input type="number" step="100" {...form.register("price")} />
              <FieldError>{form.formState.errors.price?.message}</FieldError>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={bookings.pending}>
              {editing ? "Enregistrer" : "Créer la réservation"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
