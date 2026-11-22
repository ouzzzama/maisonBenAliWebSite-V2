"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { Eye, EyeOff, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { shopItemSchema, type ShopItemInput } from "@/lib/validators";
import type { ShopItem } from "@/lib/demo-data";
import { formatMAD } from "@/lib/utils";
import { resolveImage } from "@/lib/images";

const MODE_LABEL: Record<string, string> = {
  vente: "Vente",
  location: "Location",
};

const emptyItem: ShopItemInput = {
  title: "",
  category: "Équipement",
  mode: "vente",
  price: undefined,
  unit: "unité",
  stock: 0,
  description: "",
  coverUrl: "",
  published: true,
};

export function ShopView({ initial }: { initial: ShopItem[] }) {
  const items = useCollection<ShopItem>("/api/shop", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ mode: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ShopItem | null>(null);

  const form = useForm<ShopItemInput>({
    resolver: zodForm(shopItemSchema),
    defaultValues: emptyItem,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyItem);
    setOpen(true);
  };

  const openEdit = (item: ShopItem) => {
    setEditing(item);
    form.reset({
      title: item.title,
      category: item.category,
      mode: item.mode === "location" ? "location" : "vente",
      price: item.price ?? undefined,
      unit: item.unit ?? "",
      stock: item.stock ?? 0,
      description: item.description ?? "",
      coverUrl: item.coverUrl ?? "",
      published: item.published !== false,
    });
    setOpen(true);
  };

  const onSubmit = async (values: ShopItemInput) => {
    const payload = {
      title: values.title,
      category: values.category,
      mode: values.mode,
      price: values.price ?? null,
      unit: values.unit || null,
      stock: values.stock ?? 0,
      description: values.description || "",
      coverUrl: values.coverUrl || "",
      published: Boolean(values.published),
    };
    const result = editing
      ? await items.update(editing.id, payload)
      : await items.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyItem);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.items.filter((item) => {
      if (filters.mode && item.mode !== filters.mode) return false;
      if (!term) return true;
      return [item.title, item.category, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [items.items, query, filters]);

  const saleCount = items.items.filter((item) => item.mode !== "location").length;
  const rentCount = items.items.length - saleCount;
  const totalStock = items.items.reduce((sum, item) => sum + (item.stock ?? 0), 0);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Boutique"
        title="Produits à vendre & à louer"
        description="Matériel et équipements de la maison : chaque article est vendu ou loué, avec son stock et son prix."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouvel article
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/8 bg-white px-4 py-3 text-[12px] text-muted">
        <span className="font-semibold text-ink">{items.items.length}</span> article(s)
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-emerald-600">{saleCount}</span> à vendre
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-coral">{rentCount}</span> à louer
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-ink">{totalStock}</span> en stock
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Titre, catégorie, description…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ mode: "" });
        }}
        filters={[
          {
            key: "mode",
            label: "Type",
            options: [
              { value: "vente", label: "À vendre" },
              { value: "location", label: "À louer" },
            ],
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
          >
            <div className="relative h-40 w-full overflow-hidden bg-ink/5">
              {item.coverUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveImage(item.coverUrl)}
                  alt={item.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid size-full place-items-center text-ink/25">
                  <Package className="size-7" />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink">
                {MODE_LABEL[item.mode] ?? item.mode}
              </span>
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                  item.published ? "bg-emerald-600 text-white" : "bg-ink/70 text-white/85"
                }`}
              >
                {item.published ? "Publié" : "Brouillon"}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-[15px] font-semibold leading-snug text-ink">{item.title}</h2>
              <p className="mt-1 text-[11.5px] text-ink/45">{item.category}</p>

              <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink/60">
                <span>{item.stock ?? 0} en stock</span>
                {item.unit ? <span className="text-ink/20">·</span> : null}
                {item.unit ? <span>par {item.unit}</span> : null}
              </div>

              <p className="mt-2 text-[15px] font-semibold text-ink">
                {item.price ? formatMAD(item.price) : "Prix sur demande"}
              </p>

              <div className="mt-auto flex items-center gap-1 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => items.update(item.id, { published: !item.published })}
                  className="px-2 text-[11.5px]"
                >
                  {item.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {item.published ? "Dépublier" : "Publier"}
                </Button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  title="Modifier"
                  className="ml-auto grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${item.title} » de la boutique ?`))
                      items.remove(item.id);
                  }}
                  title="Supprimer"
                  className="grid size-8 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-ink/12 bg-white/60 p-12 text-center text-[13px] text-muted">
            Aucun article pour ces critères. Cliquez « Nouvel article » pour en créer un.
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'article" : "Nouvel article"}
        description="Un article est soit vendu, soit loué : le type détermine son prix et son unité."
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input {...form.register("title")} placeholder="Salon de terrasse en teck" />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Input {...form.register("category")} placeholder="Mobilier outdoor" />
              <FieldError>{form.formState.errors.category?.message}</FieldError>
            </div>
            <div>
              <Label>Vendu ou loué</Label>
              <Select {...form.register("mode")}>
                <option value="vente">À vendre</option>
                <option value="location">À louer</option>
              </Select>
            </div>
            <div>
              <Label>Prix (MAD)</Label>
              <Input type="number" step="100" {...form.register("price")} />
              <FieldError>{form.formState.errors.price?.message}</FieldError>
            </div>
            <div>
              <Label>Unité de prix</Label>
              <Select {...form.register("unit")}>
                <option value="unité">Par unité (vente)</option>
                <option value="jour">Par jour</option>
                <option value="semaine">Par semaine</option>
                <option value="mois">Par mois</option>
              </Select>
            </div>
            <div>
              <Label>Stock disponible</Label>
              <Input type="number" {...form.register("stock")} />
              <FieldError>{form.formState.errors.stock?.message}</FieldError>
            </div>
            <div className="sm:col-span-2">
              <Label>Photo (URL ou chemin du site)</Label>
              <Input {...form.register("coverUrl")} placeholder="assets/images/stock/…jpg" />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea {...form.register("description")} className="min-h-24" />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[12.5px] text-ink">
            <input type="checkbox" {...form.register("published")} className="size-4 accent-coral" />
            Publier immédiatement dans la boutique
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={items.pending}>
              {editing ? "Enregistrer" : "Créer l'article"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
