"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { Car, CheckCircle2, FileSignature, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { rentalSchema, type RentalInput } from "@/lib/validators";
import type { CarRental } from "@/lib/demo-data";
import {
  RENTAL_STATUS_LABEL,
  daysBetween,
  formatMAD,
  toInputDateTime,
} from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(RENTAL_STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

const emptyRental: RentalInput = {
  vehicle: "",
  vehiclePlate: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  pickupAt: toInputDateTime(),
  dropoffAt: toInputDateTime(new Date(Date.now() + 3 * 86_400_000)),
  pickupLocation: "Agadir — Aéroport Al Massira",
  dailyRate: 900,
  deposit: 5000,
  depositPaid: false,
  agreementSigned: false,
  driverName: "",
  driverLicense: "",
  status: "RESERVED",
  notes: "",
};

export function CarsView({ initial }: { initial: CarRental[] }) {
  const rentals = useCollection<CarRental>("/api/rentals", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ status: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CarRental | null>(null);

  const form = useForm<RentalInput>({
    resolver: zodForm(rentalSchema),
    defaultValues: emptyRental,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyRental);
    setOpen(true);
  };

  const openEdit = (rental: CarRental) => {
    setEditing(rental);
    form.reset({
      vehicle: rental.vehicle,
      vehiclePlate: rental.vehiclePlate ?? "",
      clientName: rental.clientName,
      clientEmail: rental.clientEmail ?? "",
      clientPhone: rental.clientPhone ?? "",
      pickupAt: toInputDateTime(rental.pickupAt),
      dropoffAt: toInputDateTime(rental.dropoffAt),
      pickupLocation: rental.pickupLocation,
      dailyRate: rental.dailyRate,
      deposit: rental.deposit ?? undefined,
      depositPaid: rental.depositPaid,
      agreementSigned: rental.agreementSigned,
      driverName: rental.driverName ?? "",
      driverLicense: rental.driverLicense ?? "",
      status: rental.status,
      notes: rental.notes ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: RentalInput) => {
    const days = daysBetween(values.pickupAt, values.dropoffAt);
    const payload = {
      ...values,
      pickupAt: new Date(values.pickupAt).toISOString(),
      dropoffAt: new Date(values.dropoffAt).toISOString(),
      totalPrice: Math.round(days * Number(values.dailyRate)),
    };
    const result = editing
      ? await rentals.update(editing.id, payload)
      : await rentals.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyRental);
    }
  };

  const toggle = async (rental: CarRental, field: "depositPaid" | "agreementSigned") => {
    await rentals.update(rental.id, { [field]: !rental[field] });
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return rentals.items.filter((rental) => {
      if (filters.status && rental.status !== filters.status) return false;
      if (!term) return true;
      return [rental.vehicle, rental.clientName, rental.reference, rental.vehiclePlate]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rentals.items, query, filters]);

  const active = rentals.items.filter((rental) => rental.status === "ACTIVE").length;
  const revenue = rentals.items
    .filter((rental) => rental.status !== "CANCELLED")
    .reduce((sum, rental) => sum + Number(rental.totalPrice ?? 0), 0);
  const unsigned = rentals.items.filter((rental) => !rental.agreementSigned).length;

  const columns: Column<CarRental>[] = [
    {
      key: "vehicle",
      header: "Véhicule",
      cell: (rental) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink/60">
            <Car className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink">{rental.vehicle}</p>
            <p className="font-mono text-[10.5px] text-muted">
              {rental.vehiclePlate ?? rental.reference}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (rental) => (
        <div>
          <p className="text-[12.5px] font-medium text-ink">{rental.clientName}</p>
          <p className="text-[11px] text-muted">{rental.clientPhone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Période",
      cell: (rental) => (
        <div className="text-[11.5px] text-ink/70">
          <p>{new Date(rental.pickupAt).toLocaleDateString("fr-FR")}</p>
          <p className="text-muted">→ {new Date(rental.dropoffAt).toLocaleDateString("fr-FR")}</p>
        </div>
      ),
    },
    {
      key: "pricing",
      header: "Tarif / total",
      hideOnMobile: true,
      cell: (rental) => (
        <div className="text-[12px]">
          <p className="font-semibold text-ink">{formatMAD(rental.dailyRate)}/j</p>
          <p className="text-muted">{formatMAD(rental.totalPrice)}</p>
        </div>
      ),
    },
    {
      key: "deposit",
      header: "Caution",
      hideOnMobile: true,
      cell: (rental) => (
        <button
          type="button"
          onClick={() => toggle(rental, "depositPaid")}
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
            rental.depositPaid
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <Wallet className="size-3" />
          {rental.depositPaid ? "Payée" : formatMAD(rental.deposit)}
        </button>
      ),
    },
    {
      key: "agreement",
      header: "Contrat",
      hideOnMobile: true,
      cell: (rental) => (
        <button
          type="button"
          onClick={() => toggle(rental, "agreementSigned")}
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
            rental.agreementSigned
              ? "bg-emerald-50 text-emerald-700"
              : "bg-ink/5 text-ink/55 hover:bg-ink/10"
          }`}
        >
          {rental.agreementSigned ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <FileSignature className="size-3" />
          )}
          {rental.agreementSigned ? "Signé" : "À signer"}
        </button>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (rental) => (
        <StatusBadge status={rental.status} label={RENTAL_STATUS_LABEL[rental.status]} />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (rental) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(rental)}
            title="Modifier"
            className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Supprimer la location ${rental.reference} ?`))
                rentals.remove(rental.id);
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
        eyebrow="Benali Cars"
        title="Locations de véhicules"
        description="Flotte, périodes, cautions et contrats de location."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouvelle location
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Locations en cours", value: String(active), icon: <Car className="size-4" /> },
          { label: "Volume location", value: formatMAD(revenue), icon: <Wallet className="size-4" /> },
          { label: "Contrats à signer", value: String(unsigned), icon: <FileSignature className="size-4" /> },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-coral/10 text-coral">
              {item.icon}
            </span>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                {item.label}
              </p>
              <p className="text-[16px] font-semibold text-ink">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Véhicule, client, immatriculation…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ status: "" });
        }}
        filters={[{ key: "status", label: "Statut", options: STATUS_OPTIONS }]}
      />

      <DataTable
        rows={filtered}
        columns={columns}
        empty="Aucune location pour ces filtres."
        footer={<span>{filtered.length} location(s) affichée(s)</span>}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Location ${editing.reference}` : "Nouvelle location"}
        description="Le total est recalculé à partir des dates et du tarif journalier."
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label>Véhicule</Label>
              <Input {...form.register("vehicle")} placeholder="Range Rover Velar 2024" />
              <FieldError>{form.formState.errors.vehicle?.message}</FieldError>
            </div>
            <div>
              <Label>Immatriculation</Label>
              <Input {...form.register("vehiclePlate")} />
            </div>
            <div>
              <Label>Client</Label>
              <Input {...form.register("clientName")} />
              <FieldError>{form.formState.errors.clientName?.message}</FieldError>
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
              <Label>Départ</Label>
              <Input type="datetime-local" {...form.register("pickupAt")} />
              <FieldError>{form.formState.errors.pickupAt?.message}</FieldError>
            </div>
            <div>
              <Label>Retour</Label>
              <Input type="datetime-local" {...form.register("dropoffAt")} />
              <FieldError>{form.formState.errors.dropoffAt?.message}</FieldError>
            </div>
            <div>
              <Label>Lieu de prise en charge</Label>
              <Input {...form.register("pickupLocation")} />
            </div>
            <div>
              <Label>Tarif journalier (MAD)</Label>
              <Input type="number" step="10" {...form.register("dailyRate")} />
              <FieldError>{form.formState.errors.dailyRate?.message}</FieldError>
            </div>
            <div>
              <Label>Caution (MAD)</Label>
              <Input type="number" step="100" {...form.register("deposit")} />
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
              <Label>Conducteur</Label>
              <Input {...form.register("driverName")} />
            </div>
            <div>
              <Label>Permis</Label>
              <Input {...form.register("driverLicense")} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 rounded-2xl bg-cream p-3.5">
            <label className="inline-flex items-center gap-2 text-[12px] font-medium text-ink/70">
              <input type="checkbox" {...form.register("depositPaid")} className="size-4 accent-[#ef453b]" />
              Caution encaissée
            </label>
            <label className="inline-flex items-center gap-2 text-[12px] font-medium text-ink/70">
              <input
                type="checkbox"
                {...form.register("agreementSigned")}
                className="size-4 accent-[#ef453b]"
              />
              Contrat signé
            </label>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11.5px] text-muted">
              Total estimé :{" "}
              <span className="font-semibold text-ink">
                {formatMAD(
                  daysBetween(
                    form.watch("pickupAt") || new Date().toISOString(),
                    form.watch("dropoffAt") || new Date().toISOString()
                  ) * Number(form.watch("dailyRate") || 0)
                )}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="coral" disabled={rentals.pending}>
                {editing ? "Enregistrer" : "Créer la location"}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
