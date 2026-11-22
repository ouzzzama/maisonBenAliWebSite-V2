"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Car,
  HardHat,
  KeyRound,
  Plus,
  Receipt,
  Shapes,
  Store,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { StatusBadge, Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { STREAMS, STREAM_OPTIONS, normalizeStream, streamLabel } from "@/lib/streams";
import { transactionSchema, type TransactionInput } from "@/lib/validators";
import type { Transaction } from "@/lib/demo-data";
import {
  TX_STATUS_LABEL,
  TX_TYPE_LABEL,
  formatDate,
  formatMAD,
  toInputDate,
} from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(TX_STATUS_LABEL).map(([value, label]) => ({ value, label }));

/* Une icône blanche par secteur, posée dans la couleur du métier. */
const SECTOR_ICON: Record<string, LucideIcon> = {
  sale: Building2,
  project: HardHat,
  booking: KeyRound,
  rental: Car,
  shop: Store,
  other: Shapes,
};

const emptyTx: TransactionInput = {
  label: "",
  amount: 0,
  type: "PAYMENT",
  status: "PAID",
  method: "Virement",
  stream: "sale",
  occurredAt: toInputDate(),
};

export function FinanceView({ initial }: { initial: Transaction[] }) {
  const transactions = useCollection<Transaction>("/api/transactions", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ status: "", stream: "" });
  const [open, setOpen] = React.useState(false);

  const form = useForm<TransactionInput>({
    resolver: zodForm(transactionSchema),
    defaultValues: emptyTx,
  });

  const onSubmit = async (values: TransactionInput) => {
    const payload = { ...values, occurredAt: new Date(values.occurredAt).toISOString() };
    const result = await transactions.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyTx);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return transactions.items.filter((tx) => {
      if (filters.status && tx.status !== filters.status) return false;
      if (filters.stream && tx.stream !== filters.stream) return false;
      if (!term) return true;
      return [tx.label, tx.reference, tx.method].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [transactions.items, query, filters]);

  // Revenus par secteur d'activité : le bloc d'en-tête détaille chaque métier.
  const sectorCards = React.useMemo(
    () =>
      STREAMS.map((sector) => {
        const rows = transactions.items.filter(
          (tx) => normalizeStream(tx.stream) === sector.key && tx.type !== "EXPENSE"
        );
        const collected = rows.filter((tx) => tx.status === "PAID");
        return {
          key: sector.key,
          label: sector.label,
          color: sector.color,
          total: collected.reduce((sum, tx) => sum + Number(tx.amount), 0),
          count: collected.length,
          waiting: rows
            .filter((tx) => tx.status !== "PAID")
            .reduce((sum, tx) => sum + Number(tx.amount), 0),
        };
      }),
    [transactions.items]
  );

  const paidIn = transactions.items
    .filter((tx) => tx.status === "PAID" && tx.type !== "EXPENSE")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const pending = transactions.items
    .filter((tx) => tx.status === "PENDING")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const overdue = transactions.items
    .filter((tx) => tx.status === "OVERDUE")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expenses = transactions.items
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthly = React.useMemo(() => {
    const months: Record<string, number | string>[] = [];
    const now = new Date();
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const row: Record<string, number | string> = {
        month: date.toLocaleDateString("fr-FR", { month: "short" }),
        total: 0,
      };
      for (const sector of STREAMS) row[sector.key] = 0;
      months.push(row);
    }
    for (const tx of transactions.items) {
      if (tx.status !== "PAID" || tx.type === "EXPENSE") continue;
      const date = new Date(tx.occurredAt);
      const diff =
        (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diff < 0 || diff > 5) continue;
      const bucket = months[5 - diff];
      const amount = Number(tx.amount);
      const key = normalizeStream(tx.stream);
      bucket[key] = Number(bucket[key]) + amount;
      bucket.total = Number(bucket.total) + amount;
    }
    return months;
  }, [transactions.items]);

  const columns: Column<Transaction>[] = [
    {
      key: "ref",
      header: "Référence",
      cell: (tx) => (
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-ink/5 text-ink/50">
            <Receipt className="size-3.5" />
          </span>
          <span className="font-mono text-[11px] font-semibold text-ink/60">{tx.reference}</span>
        </div>
      ),
    },
    {
      key: "label",
      header: "Libellé",
      cell: (tx) => (
        <div>
          <p className="text-[12.5px] font-medium text-ink">{tx.label}</p>
          <p className="text-[11px] text-muted">
            {tx.method ?? "—"} · {streamLabel(tx.stream)}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (tx) => <span className="text-[12px] text-ink/60">{formatDate(tx.occurredAt)}</span>,
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (tx) => (
        <Pill
          className={
            tx.type === "EXPENSE"
              ? "bg-rose-50 text-rose-600"
              : tx.type === "DEPOSIT"
                ? "bg-amber-50 text-amber-700"
                : "bg-ink/5 text-ink/65"
          }
        >
          {TX_TYPE_LABEL[tx.type]}
        </Pill>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      className: "text-right",
      cell: (tx) => (
        <span
          className={
            tx.type === "EXPENSE" || tx.type === "REFUND"
              ? "font-semibold text-rose-600"
              : "font-semibold text-ink"
          }
        >
          {tx.type === "EXPENSE" || tx.type === "REFUND" ? "−" : "+"}
          {formatMAD(tx.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (tx) => <StatusBadge status={tx.status} label={TX_STATUS_LABEL[tx.status]} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (tx) => (
        <div className="flex items-center justify-end gap-1">
          {tx.status !== "PAID" ? (
            <button
              type="button"
              onClick={() => transactions.update(tx.id, { status: "PAID" })}
              className="rounded-full bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Marquer payé
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Supprimer la transaction ${tx.reference} ?`))
                transactions.remove(tx.id);
            }}
            className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Finance"
        title="Trésorerie & revenus"
        description="Encaissements consolidés par secteur : vente, VEFA, location, cars et boutique."
        actions={
          <Button variant="coral" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nouvelle transaction
          </Button>
        }
      />

      {/* Revenus par secteur : chaque métier a son propre bloc. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sectorCards.map((sector) => {
          const Icon = SECTOR_ICON[sector.key] ?? Shapes;
          const suffix = sector.count === 1 ? "" : "s";
          return (
            /* rien à gauche, la couleur du secteur arrive vers le bord droit */
            <div
              key={sector.key}
              className="relative overflow-hidden rounded-3xl border border-ink/8 p-4 pr-14 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
              style={{
                background: `linear-gradient(90deg, #ffffff 0%, #ffffff 45%, ${sector.color}1a 65%, ${sector.color}b8 100%)`,
              }}
            >
              {/* rognée de moitié par le bord droit */}
              <Icon
                aria-hidden="true"
                strokeWidth={1.4}
                className="pointer-events-none absolute -right-10 top-1/2 size-20 -translate-y-1/2 text-white opacity-50"
              />
              <div className="relative flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: sector.color }}
                />
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                  {sector.label}
                </p>
              </div>
              <p className="relative mt-2 text-[22px] font-semibold leading-none text-ink">
                {formatMAD(sector.total)}
              </p>
              <p className="relative mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <ArrowUpRight className="size-3 text-emerald-600" />
                  {sector.count} écriture{suffix} encaissée{suffix}
                </span>
                {sector.waiting > 0 ? (
                  <span className="inline-flex items-center gap-1 text-rose-500">
                    · <ArrowDownRight className="size-3" /> {formatMAD(sector.waiting)} en attente
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>

      {/* Totaux consolidés, tous secteurs confondus. */}
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/8 bg-ink/8 sm:grid-cols-4">
        {[
          { label: "Total encaissé", value: formatMAD(paidIn) },
          { label: "En attente", value: formatMAD(pending) },
          { label: "En retard", value: formatMAD(overdue) },
          { label: "Dépenses", value: formatMAD(expenses) },
        ].map((item) => (
          <div key={item.label} className="bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/40">
              {item.label}
            </p>
            <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-ink/8 bg-white p-4 shadow-[0_2px_10px_rgba(18,43,67,0.04)]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink">Encaissements mensuels par secteur</h2>
          <span className="text-[11px] text-muted">6 derniers mois</span>
        </div>
        <RevenueChart
          data={monthly}
          series={STREAMS.map((sector) => ({
            key: sector.key,
            name: sector.label,
            color: sector.color,
          }))}
        />
      </div>

      <div className="mt-4">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Libellé, référence, moyen…"
          values={filters}
          onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={() => {
            setQuery("");
            setFilters({ status: "", stream: "" });
          }}
          filters={[
            { key: "status", label: "Statut", options: STATUS_OPTIONS },
            { key: "stream", label: "Activité", options: STREAM_OPTIONS },
          ]}
        />

        <DataTable
          rows={filtered}
          columns={columns}
          empty="Aucune transaction pour ces filtres."
          footer={
            <span>
              Solde net affiché :{" "}
              <span className="font-semibold text-ink">
                {formatMAD(
                  filtered
                    .filter((tx) => tx.status === "PAID")
                    .reduce(
                      (sum, tx) =>
                        sum + (tx.type === "EXPENSE" || tx.type === "REFUND" ? -Number(tx.amount) : Number(tx.amount)),
                      0
                    )
                )}
              </span>
            </span>
          }
        />
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle transaction"
        description="Encaissement, caution, remboursement ou dépense."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Libellé</Label>
            <Input {...form.register("label")} placeholder="Acompte VEFA — Lot B2" />
            <FieldError>{form.formState.errors.label?.message}</FieldError>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Montant (MAD)</Label>
              <Input type="number" step="100" {...form.register("amount")} />
              <FieldError>{form.formState.errors.amount?.message}</FieldError>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" {...form.register("occurredAt")} />
              <FieldError>{form.formState.errors.occurredAt?.message}</FieldError>
            </div>
            <div>
              <Label>Type</Label>
              <Select {...form.register("type")}>
                {Object.entries(TX_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
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
              <Label>Activité</Label>
              <Select {...form.register("stream")}>
                {STREAM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Moyen</Label>
              <Input {...form.register("method")} placeholder="Virement, carte, espèces…" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={transactions.pending}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
