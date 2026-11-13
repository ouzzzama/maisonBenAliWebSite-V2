"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { ArrowRight, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { StatusBadge, Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { leadSchema, type LeadInput } from "@/lib/validators";
import type { Lead } from "@/lib/demo-data";
import {
  INTEREST_LABEL,
  LEAD_STATUS_LABEL,
  formatDate,
  formatMAD,
  initials,
} from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => ({ value, label }));
const INTEREST_OPTIONS = Object.entries(INTEREST_LABEL).map(([value, label]) => ({ value, label }));

const emptyLead: LeadInput = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  status: "NEW",
  interest: "ACHAT",
  source: "Site web",
  budget: undefined,
  notes: "",
  tags: "",
};

export function LeadsView({ initial }: { initial: Lead[] }) {
  const leads = useCollection<Lead>("/api/leads", initial);
  const clients = useCollection<{ id: string }>("/api/clients", []);

  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ status: "", interest: "", from: "", to: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Lead | null>(null);
  const [converting, setConverting] = React.useState<string | null>(null);

  const form = useForm<LeadInput>({
    resolver: zodForm(leadSchema),
    defaultValues: emptyLead,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyLead);
    setOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    form.reset({
      fullName: lead.fullName,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      status: lead.status,
      interest: lead.interest,
      source: lead.source ?? "",
      budget: lead.budget ?? undefined,
      notes: lead.notes ?? "",
      tags: (lead.tags ?? []).join(", "),
    });
    setOpen(true);
  };

  const onSubmit = async (values: LeadInput) => {
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
    };
    const result = editing
      ? await leads.update(editing.id, payload)
      : await leads.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyLead);
    }
  };

  const convertToClient = async (lead: Lead) => {
    setConverting(lead.id);
    const created = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        address: "",
        notes: lead.notes,
        tags: lead.tags,
        leadId: lead.id,
        createdAt: new Date().toISOString(),
      }),
    }).then((response) => response.ok);
    if (created) {
      await leads.update(lead.id, { status: "WON" });
      clients.refresh();
    }
    setConverting(null);
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.items.filter((lead) => {
      const haystack = [lead.fullName, lead.email, lead.phone, lead.company, ...(lead.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (filters.status && lead.status !== filters.status) return false;
      if (filters.interest && lead.interest !== filters.interest) return false;
      if (filters.from && new Date(lead.createdAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(lead.createdAt) > new Date(`${filters.to}T23:59:59`)) return false;
      return true;
    });
  }, [leads.items, query, filters]);

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Prospect",
      cell: (lead) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink/6 text-[11px] font-semibold text-ink/70">
            {initials(lead.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{lead.fullName}</p>
            <p className="truncate text-[11px] text-muted">
              {lead.company ?? lead.email ?? lead.phone ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (lead) => <StatusBadge status={lead.status} label={LEAD_STATUS_LABEL[lead.status]} />,
    },
    {
      key: "interest",
      header: "Intérêt",
      cell: (lead) => <Pill>{INTEREST_LABEL[lead.interest]}</Pill>,
      hideOnMobile: true,
    },
    {
      key: "budget",
      header: "Budget",
      cell: (lead) => (
        <span className="font-medium text-ink">{lead.budget ? formatMAD(lead.budget) : "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "tags",
      header: "Tags",
      hideOnMobile: true,
      cell: (lead) => (
        <div className="flex flex-wrap gap-1">
          {(lead.tags ?? []).slice(0, 3).map((tag) => (
            <Pill key={tag} className="bg-coral/8 text-coral">
              {tag}
            </Pill>
          ))}
          {!lead.tags?.length ? <span className="text-ink/30">—</span> : null}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      cell: (lead) => <span className="text-[12px] text-ink/55">{formatDate(lead.createdAt)}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (lead) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Convertir en client"
            onClick={() => convertToClient(lead)}
            disabled={converting === lead.id || lead.status === "WON"}
            className="grid size-8 place-items-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-30"
          >
            <UserCheck className="size-4" />
          </button>
          <button
            type="button"
            title="Modifier"
            onClick={() => openEdit(lead)}
            className="grid size-8 place-items-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            title="Supprimer"
            onClick={() => {
              if (window.confirm(`Supprimer le lead « ${lead.fullName} » ?`)) leads.remove(lead.id);
            }}
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
        title="Leads"
        description="Prospects entrants, qualification et conversion en client."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouveau lead
          </Button>
        }
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Nom, email, téléphone, tag…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ status: "", interest: "", from: "", to: "" });
        }}
        filters={[
          { key: "status", label: "Statut", options: STATUS_OPTIONS },
          { key: "interest", label: "Intérêt", options: INTEREST_OPTIONS },
        ]}
        extra={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({ ...current, from: event.target.value }))
              }
              className="h-10 w-auto text-[12px]"
              aria-label="Depuis"
            />
            <span className="text-[11px] text-ink/35">→</span>
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
              className="h-10 w-auto text-[12px]"
              aria-label="Jusqu'au"
            />
          </div>
        }
      />

      <DataTable
        rows={filtered}
        columns={columns}
        empty="Aucun lead ne correspond à ces filtres."
        footer={
          <>
            <span>
              {filtered.length} lead{filtered.length > 1 ? "s" : ""} affiché
              {filtered.length > 1 ? "s" : ""} sur {leads.items.length}
            </span>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1 font-semibold text-coral"
            >
              Ajouter <ArrowRight className="size-3" />
            </button>
          </>
        }
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier le lead" : "Nouveau lead"}
        description="Les champs marqués sont validés côté client et côté API."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nom complet</Label>
              <Input {...form.register("fullName")} placeholder="Nom et prénom" />
              <FieldError>{form.formState.errors.fullName?.message}</FieldError>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} placeholder="nom@email.com" />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...form.register("phone")} placeholder="+212 6.." />
              <FieldError>{form.formState.errors.phone?.message}</FieldError>
            </div>
            <div>
              <Label>Société</Label>
              <Input {...form.register("company")} placeholder="Optionnel" />
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
              <Label>Intérêt</Label>
              <Select {...form.register("interest")}>
                {INTEREST_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Input {...form.register("source")} placeholder="Site, Instagram, WhatsApp…" />
            </div>
            <div>
              <Label>Budget (MAD)</Label>
              <Input type="number" step="1000" {...form.register("budget")} placeholder="1 500 000" />
              <FieldError>{form.formState.errors.budget?.message}</FieldError>
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <Input {...form.register("tags")} placeholder="MRE, Vue mer, Investisseur" />
            <p className="mt-1 text-[11px] text-muted">Séparés par des virgules.</p>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Contexte, besoins, prochaine étape…" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={leads.pending}>
              {editing ? "Enregistrer" : "Créer le lead"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
