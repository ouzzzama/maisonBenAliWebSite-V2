"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { ExternalLink, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { marketplaceSchema, type MarketplaceInput } from "@/lib/validators";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_STATUS_LABEL,
  platformLabel,
  statusLabel,
} from "@/lib/marketplaces";
import type { MarketplaceListing, Product } from "@/lib/demo-data";
import { cn, formatMAD } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  draft: "bg-ink/5 text-ink/60 ring-1 ring-inset ring-ink/10",
  paused: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  expired: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/20",
};

const emptyListing: MarketplaceInput = {
  platform: "airbnb",
  title: "",
  productId: "",
  externalUrl: "",
  status: "draft",
  price: undefined,
  views: 0,
  contacts: 0,
  notes: "",
};

export function MarketplacesView({
  initial,
  products,
}: {
  initial: MarketplaceListing[];
  products: Product[];
}) {
  const listings = useCollection<MarketplaceListing>("/api/marketplaces", initial);
  const [query, setQuery] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MarketplaceListing | null>(null);

  const form = useForm<MarketplaceInput>({
    resolver: zodForm(marketplaceSchema),
    defaultValues: emptyListing,
  });

  const openCreate = (value = "airbnb") => {
    setEditing(null);
    form.reset({ ...emptyListing, platform: value as MarketplaceInput["platform"] });
    setOpen(true);
  };

  const openEdit = (listing: MarketplaceListing) => {
    setEditing(listing);
    form.reset({
      platform: listing.platform as MarketplaceInput["platform"],
      title: listing.title,
      productId: listing.productId ?? "",
      externalUrl: listing.externalUrl ?? "",
      status: listing.status as MarketplaceInput["status"],
      price: listing.price ?? undefined,
      views: listing.views ?? 0,
      contacts: listing.contacts ?? 0,
      notes: listing.notes ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: MarketplaceInput) => {
    const payload = {
      platform: values.platform,
      title: values.title,
      productId: values.productId || null,
      externalUrl: values.externalUrl || null,
      status: values.status,
      price: values.price ?? null,
      views: values.views ?? 0,
      contacts: values.contacts ?? 0,
      notes: values.notes || "",
      publishedAt:
        values.status === "published"
          ? (editing?.publishedAt ?? new Date().toISOString())
          : null,
    };
    const result = editing
      ? await listings.update(editing.id, payload)
      : await listings.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyListing);
    }
  };

  const toggleStatus = (listing: MarketplaceListing) => {
    const next = listing.status === "published" ? "paused" : "published";
    listings.update(listing.id, {
      status: next,
      publishedAt: next === "published" ? new Date().toISOString() : null,
    });
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return listings.items.filter((listing) => {
      if (platform && listing.platform !== platform) return false;
      if (!term) return true;
      const product = products.find((item) => item.id === listing.productId);
      return [listing.title, listing.notes, product?.title, platformLabel(listing.platform)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [listings.items, platform, products, query]);

  const onlineCount = listings.items.filter((listing) => listing.status === "published").length;

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Diffusion"
        title="Marketplaces"
        description="Suivez les annonces publiées sur Airbnb, Mubawab, Avito et Hespress Immobilier : lien, statut, prix, vues et contacts reçus."
        actions={
          <Button variant="coral" onClick={() => openCreate()}>
            <Plus className="size-4" /> Nouvelle annonce
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/8 bg-white px-4 py-3 text-[12px] text-muted">
        <span className="font-semibold text-ink">{listings.items.length}</span> annonce(s)
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-emerald-600">{onlineCount}</span> en ligne
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-ink">
          {listings.items.reduce((sum, listing) => sum + Number(listing.contacts ?? 0), 0)}
        </span>{" "}
        contacts reçus
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MARKETPLACE_PLATFORMS.map((item) => {
          const rows = listings.items.filter((listing) => listing.platform === item.value);
          const online = rows.filter((listing) => listing.status === "published").length;
          return (
            <div
              key={item.value}
              className="flex flex-col rounded-3xl border border-ink/8 bg-white p-4 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-inset ring-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logo}
                    alt={`${item.label} — logo`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{item.label}</p>
                  <p className="truncate text-[11px] text-ink/45">{item.hint}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Ouvrir ${item.label}`}
                  className="focus-ring ml-auto grid size-7 shrink-0 place-items-center rounded-lg text-ink/35 transition hover:bg-ink/5 hover:text-ink"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink/55">
                <span>
                  <b className="text-ink">{rows.length}</b> annonce(s)
                </span>
                <span className="text-ink/20">·</span>
                <span>
                  <b className="text-emerald-600">{online}</b> en ligne
                </span>
              </div>

              <button
                type="button"
                onClick={() => openCreate(item.value)}
                className="focus-ring mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-ink/12 text-[11.5px] font-semibold text-ink/65 transition hover:border-ink/25 hover:text-ink"
              >
                <Plus className="size-3.5" /> Nouvelle annonce
              </button>
            </div>
          );
        })}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/40">
          Portail
        </span>
        {[{ value: "", label: "Tous" }, ...MARKETPLACE_PLATFORMS].map((option) => {
          const selected = platform === option.value;
          const count = option.value
            ? listings.items.filter((listing) => listing.platform === option.value).length
            : listings.items.length;
          return (
            <button
              key={option.value || "all"}
              type="button"
              aria-pressed={selected}
              onClick={() => setPlatform(option.value)}
              className={cn(
                "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition",
                selected
                  ? "border-coral bg-coral text-white"
                  : "border-ink/10 bg-white text-ink/60 hover:border-ink/25 hover:text-ink"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "grid min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold",
                  selected ? "bg-white/22 text-white" : "bg-ink/6 text-ink/45"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Titre, bien lié, note…"
        values={{}}
        onFilterChange={() => {}}
        onReset={() => {
          setQuery("");
          setPlatform("");
        }}
      />

      {/* Un bloc de projets par portail, en colonnes sous les cartes. */}
      <div className={cn("grid gap-3", platform ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4")}>
        {(platform
          ? MARKETPLACE_PLATFORMS.filter((item) => item.value === platform)
          : MARKETPLACE_PLATFORMS
        ).map((column) => {
          const rows = filtered.filter((listing) => listing.platform === column.value);
          return (
            <section
              key={column.value}
              className="flex flex-col gap-2 rounded-3xl border border-ink/8 bg-white/55 p-2.5"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/40">
                  Projets diffusés
                </span>
                <span className="rounded-full bg-white px-1.5 text-[10px] font-bold text-ink/50 ring-1 ring-inset ring-ink/10">
                  {rows.length}
                </span>
              </div>
              {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-ink/12 bg-white/70 px-3 py-8 text-center text-[11px] leading-snug text-ink/40">
                  {query.trim()
                    ? "Aucun projet ne correspond à la recherche."
                    : "Aucun projet diffusé sur ce portail."}
                </p>
              ) : null}

              {rows.map((listing) => {
                const product = products.find((item) => item.id === listing.productId);
                return (
            <article
              key={listing.id}
              className="flex flex-col gap-2 rounded-2xl border border-ink/8 bg-white p-3 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">
                    {listing.title}
                  </h2>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      STATUS_TONE[listing.status] ?? STATUS_TONE.draft
                    )}
                  >
                    {statusLabel(listing.status)}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-ink/45">
                  {listing.price ? formatMAD(listing.price) : "Prix libre"}
                  {product ? ` · ${product.title}` : ""}
                </p>
                {listing.notes ? (
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] text-ink/35">{listing.notes}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-1 border-t border-ink/8 pt-2">
                {listing.externalUrl ? (
                  <a
                    href={listing.externalUrl}
                    target="_blank"
                    rel="noopener"
                    title="Ouvrir l'annonce"
                    className="focus-ring grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleStatus(listing)}
                  title={listing.status === "published" ? "Mettre en pause" : "Publier"}
                  className="focus-ring grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  {listing.status === "published" ? (
                    <Pause className="size-3.5" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(listing)}
                  title="Modifier"
                  className="focus-ring grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${listing.title} » des marketplaces ?`))
                      listings.remove(listing.id);
                  }}
                  title="Supprimer"
                  className="focus-ring grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <span className="ml-auto text-[10.5px] text-ink/45">
                  {listing.views ?? 0} vues · {listing.contacts ?? 0} contacts
                </span>
              </div>
            </article>
                );
              })}
            </section>
          );
        })}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'annonce" : "Nouvelle annonce"}
        description="Une annonce relie un bien du catalogue à sa publication sur un portail externe."
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Portail</Label>
              <Select {...form.register("platform")}>
                {MARKETPLACE_PLATFORMS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
              <FieldError>{form.formState.errors.platform?.message}</FieldError>
            </div>
            <div>
              <Label>Statut</Label>
              <Select {...form.register("status")}>
                {Object.entries(MARKETPLACE_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Titre de l&apos;annonce</Label>
              <Input {...form.register("title")} placeholder="Villa Founty Beach — 4 suites" />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <Label>Bien lié (optionnel)</Label>
              <Select {...form.register("productId")}>
                <option value="">Aucun bien lié</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Lien de l&apos;annonce</Label>
              <Input {...form.register("externalUrl")} placeholder="https://www.airbnb.com/rooms/…" />
              <FieldError>{form.formState.errors.externalUrl?.message}</FieldError>
            </div>
            <div>
              <Label>Prix affiché (MAD)</Label>
              <Input type="number" step="100" {...form.register("price")} />
              <FieldError>{form.formState.errors.price?.message}</FieldError>
            </div>
            <div>
              <Label>Vues</Label>
              <Input type="number" {...form.register("views")} />
            </div>
            <div>
              <Label>Contacts reçus</Label>
              <Input type="number" {...form.register("contacts")} />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              {...form.register("notes")}
              className="min-h-20"
              placeholder="Options, durée de diffusion, performance…"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={listings.pending}>
              {editing ? "Enregistrer" : "Créer l'annonce"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
