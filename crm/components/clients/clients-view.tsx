"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { clientSchema, type ClientInput } from "@/lib/validators";
import type { Client } from "@/lib/demo-data";
import { formatDate, initials } from "@/lib/utils";

const emptyClient: ClientInput = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
  tags: "",
};

export function ClientsView({
  initial,
  bookings,
}: {
  initial: Client[];
  bookings: { clientId: string | null }[];
}) {
  const clients = useCollection<Client>("/api/clients", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ tag: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);

  const form = useForm<ClientInput>({
    resolver: zodForm(clientSchema),
    defaultValues: emptyClient,
  });

  const allTags = React.useMemo(
    () => Array.from(new Set(clients.items.flatMap((client) => client.tags ?? []))).sort(),
    [clients.items]
  );

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyClient);
    setOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    form.reset({
      fullName: client.fullName,
      email: client.email ?? "",
      phone: client.phone ?? "",
      company: client.company ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
      tags: (client.tags ?? []).join(", "),
    });
    setOpen(true);
  };

  const onSubmit = async (values: ClientInput) => {
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
    };
    const result = editing
      ? await clients.update(editing.id, payload)
      : await clients.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyClient);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return clients.items.filter((client) => {
      const haystack = [client.fullName, client.email, client.phone, client.company, client.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (filters.tag && !(client.tags ?? []).includes(filters.tag)) return false;
      return true;
    });
  }, [clients.items, query, filters]);

  const opsCount = (id: string) => bookings.filter((booking) => booking.clientId === id).length;

  const columns: Column<Client>[] = [
    {
      key: "name",
      header: "Client",
      cell: (client) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">
            {initials(client.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{client.fullName}</p>
            <p className="truncate text-[11px] text-muted">
              {client.company ?? client.address ?? "Client particulier"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      hideOnMobile: true,
      cell: (client) => (
        <div className="space-y-0.5 text-[12px]">
          <p className="text-ink/75">{client.email ?? "—"}</p>
          <p className="text-muted">{client.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "tags",
      header: "Segments",
      hideOnMobile: true,
      cell: (client) => (
        <div className="flex flex-wrap gap-1">
          {(client.tags ?? []).map((tag) => (
            <Pill key={tag} className="bg-ink/5 text-ink/70">
              {tag}
            </Pill>
          ))}
          {!client.tags?.length ? <span className="text-ink/30">—</span> : null}
        </div>
      ),
    },
    {
      key: "ops",
      header: "Opérations",
      hideOnMobile: true,
      cell: (client) => (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {opsCount(client.id)}
        </span>
      ),
    },
    {
      key: "source",
      header: "Origine",
      hideOnMobile: true,
      cell: (client) =>
        client.leadId ? (
          <Pill className="bg-coral/10 text-coral">Lead converti</Pill>
        ) : (
          <span className="text-[11.5px] text-ink/40">Direct</span>
        ),
    },
    {
      key: "createdAt",
      header: "Depuis",
      hideOnMobile: true,
      cell: (client) => (
        <span className="text-[12px] text-ink/55">{formatDate(client.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (client) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(client)}
            title="Modifier"
            className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Supprimer le client « ${client.fullName} » ?`))
                clients.remove(client.id);
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
        eyebrow="CRM"
        title="Clients"
        description="Base clients consolidée, segments et historique d'opérations."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Nouveau client
          </Button>
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Nom, email, société, adresse…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ tag: "" });
        }}
        filters={[
          {
            key: "tag",
            label: "Segment",
            options: allTags.map((tag) => ({ value: tag, label: tag })),
          },
        ]}
      />

      <DataTable
        rows={filtered}
        columns={columns}
        empty="Aucun client pour ces critères."
        footer={
          <span>
            {filtered.length} client{filtered.length > 1 ? "s" : ""} · {clients.items.length} au total
          </span>
        }
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier le client" : "Nouveau client"}
        description="Les coordonnées alimentent les réservations et la facturation."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nom complet</Label>
              <Input {...form.register("fullName")} />
              <FieldError>{form.formState.errors.fullName?.message}</FieldError>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...form.register("phone")} />
            </div>
            <div>
              <Label>Société</Label>
              <Input {...form.register("company")} />
            </div>
          </div>
          <div>
            <Label>Adresse</Label>
            <Input {...form.register("address")} />
          </div>
          <div>
            <Label>Segments</Label>
            <Input {...form.register("tags")} placeholder="MRE, Investisseur, VIP" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={clients.pending}>
              {editing ? "Enregistrer" : "Créer le client"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
