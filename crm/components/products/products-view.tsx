"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { ExternalLink, Eye, EyeOff, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { productSchema, type ProductInput } from "@/lib/validators";
import { CATEGORY_LABEL, PRODUCT_CATEGORIES, normalizeCategory } from "@/lib/categories";
import type { Product } from "@/lib/demo-data";
import { formatMAD } from "@/lib/utils";
import { resolveImage } from "@/lib/images";
import type { ParsedListing } from "@/lib/ocr";
import { OcrImport } from "@/components/products/ocr-import";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

const DEAL_LABEL: Record<string, string> = {
  vente: "Vente",
  location: "Location",
};

const emptyProduct: ProductInput = {
  title: "",
  category: "appartement",
  deal: "vente",
  location: "founty",
  address: "",
  price: undefined,
  surface: undefined,
  rooms: undefined,
  baths: undefined,
  description: "",
  coverUrl: "",
  gallery: "",
  badge: "",
  published: true,
};

export function ProductsView({
  initial,
  initialDeal = "",
  initialCategory = "",
  embedded = false,
}: {
  initial: Product[];
  /** « vente » ou « location » : la section du CRM ouvre la liste déjà filtrée. */
  initialDeal?: string;
  /** Catégorie de bien choisie dans « Gestion de stock ». */
  initialCategory?: string;
  /** Intégré dans « Gestion de stock » : le titre de page est porté par l'onglet. */
  embedded?: boolean;
}) {
  const products = useCollection<Product>("/api/products", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ category: initialCategory, deal: initialDeal });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  const form = useForm<ProductInput>({
    resolver: zodForm(productSchema),
    defaultValues: emptyProduct,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset(emptyProduct);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    form.reset({
      title: product.title,
      category: normalizeCategory(product.category) || "appartement",
      deal: product.deal === "location" ? "location" : "vente",
      location: product.location,
      address: product.address ?? "",
      price: product.price ?? undefined,
      surface: product.surface ?? undefined,
      rooms: product.rooms ?? undefined,
      baths: product.baths ?? undefined,
      description: product.description ?? "",
      coverUrl: product.coverUrl ?? "",
      gallery: (product.gallery ?? []).join("\n"),
      badge: product.badge ?? "",
      published: product.published !== false,
    });
    setOpen(true);
  };

  /** Remplit la fiche avec ce que l'OCR a lu sur l'annonce photographiée. */
  const applyParsed = (parsed: ParsedListing) => {
    if (parsed.title) form.setValue("title", parsed.title, { shouldDirty: true });
    if (parsed.price) form.setValue("price", parsed.price, { shouldDirty: true });
    if (parsed.surface) form.setValue("surface", parsed.surface, { shouldDirty: true });
    if (parsed.rooms) form.setValue("rooms", parsed.rooms, { shouldDirty: true });
    if (parsed.baths) form.setValue("baths", parsed.baths, { shouldDirty: true });
    if (parsed.address) form.setValue("address", parsed.address, { shouldDirty: true });
    if (parsed.category)
      form.setValue("category", parsed.category as ProductInput["category"], { shouldDirty: true });
    if (parsed.deal) form.setValue("deal", parsed.deal, { shouldDirty: true });
    if (parsed.location) form.setValue("location", parsed.location, { shouldDirty: true });
  };

  const onSubmit = async (values: ProductInput) => {
    const payload = {
      title: values.title,
      category: values.category,
      deal: values.deal,
      location: values.location,
      address: values.address || "",
      price: values.price ?? null,
      surface: values.surface ?? null,
      rooms: values.rooms ?? null,
      baths: values.baths ?? null,
      description: values.description || "",
      coverUrl: values.coverUrl || "",
      gallery: (values.gallery ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      badge: values.badge || "",
      published: Boolean(values.published),
    };
    const result = editing
      ? await products.update(editing.id, payload)
      : await products.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyProduct);
    }
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.items.filter((product) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.deal && (product.deal === "location" ? "location" : "vente") !== filters.deal)
        return false;
      if (!term) return true;
      return [product.title, product.address, product.location, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [products.items, query, filters]);

  const publishedCount = products.items.filter((product) => product.published).length;

  return (
    <div className="animate-in">
      {embedded ? (
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <Button variant="coral" onClick={openCreate}>
            <Plus className="size-4" /> Nouveau produit
          </Button>
        </div>
      ) : (
        <PageHeader
          eyebrow="Catalogue"
          title="Biens & produits"
          description="Créez un bien ici : publié, il apparaît sur « Propriétés & Projets » et sur sa fiche project-details."
          actions={
            <Button variant="coral" onClick={openCreate}>
              <Plus className="size-4" /> Nouveau produit
            </Button>
          }
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/8 bg-white px-4 py-3 text-[12px] text-muted">
        <span className="font-semibold text-ink">{products.items.length}</span> bien(s) au catalogue
        <span className="text-ink/25">·</span>
        <span className="font-semibold text-emerald-600">{publishedCount}</span> publié(s) sur le site
        <a
          href={`${SITE_URL}/proprietes-projets`}
          target="_blank"
          rel="noopener"
          className="ml-auto inline-flex items-center gap-1 font-semibold text-ink/60 transition hover:text-ink"
        >
          <ExternalLink className="size-3.5" /> Voir la liste publique
        </a>
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Titre, adresse, quartier…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          /* intégré, le tri vente/location et la catégorie viennent de la page
             « Gestion de stock » : on les conserve */
          setFilters({ category: initialCategory, deal: embedded ? initialDeal : "" });
        }}
        extra={
          <span className="inline-flex h-10 items-center whitespace-nowrap rounded-xl bg-ink/4 px-3 text-[12px] font-medium text-ink/60">
            {filtered.length} sur {products.items.length} bien(s)
          </span>
        }
        filters={
          embedded
            ? []
            : [
                {
                  key: "deal",
                  label: "Transaction",
                  options: [
                    { value: "vente", label: "Vente" },
                    { value: "location", label: "Location" },
                  ],
                },
                {
                  key: "category",
                  label: "Type",
                  options: PRODUCT_CATEGORIES.map((category) => ({
                    value: category.value,
                    label: category.label,
                  })),
                },
              ]
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <article
            key={product.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
          >
            <div className="relative h-40 w-full overflow-hidden bg-ink/5">
              {product.coverUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveImage(product.coverUrl)}
                  alt={product.title}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid size-full place-items-center text-[11px] text-ink/30">
                  Sans photo
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink">
                {CATEGORY_LABEL[product.category] ?? product.category}
              </span>
              <span className="absolute left-3 top-11 rounded-full bg-ink/70 px-2.5 py-1 text-[10.5px] font-semibold text-white/90">
                {DEAL_LABEL[product.deal] ?? DEAL_LABEL.vente}
              </span>
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                  product.published ? "bg-emerald-600 text-white" : "bg-ink/70 text-white/85"
                }`}
              >
                {product.published ? "Publié" : "Brouillon"}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-[15px] font-semibold leading-snug text-ink">{product.title}</h2>
              <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-ink/45">
                <MapPin className="size-3" /> {product.address || product.location}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink/60">
                {product.rooms ? <span>{product.rooms} ch</span> : null}
                {product.baths ? <span className="text-ink/20">·</span> : null}
                {product.baths ? <span>{product.baths} sdb</span> : null}
                {product.surface ? <span className="text-ink/20">·</span> : null}
                {product.surface ? <span>{product.surface} m²</span> : null}
              </div>

              <p className="mt-2 text-[15px] font-semibold text-ink">
                {product.price ? formatMAD(product.price) : "Prix sur demande"}
              </p>

              <div className="mt-auto flex items-center gap-1 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => products.update(product.id, { published: !product.published })}
                  className="px-2 text-[11.5px]"
                >
                  {product.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {product.published ? "Dépublier" : "Publier"}
                </Button>
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  title="Modifier"
                  className="ml-auto grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <a
                  href={`${SITE_URL}/project-details?bien=${product.slug}`}
                  target="_blank"
                  rel="noopener"
                  title="Voir la fiche publique"
                  className="grid size-8 place-items-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                >
                  <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${product.title} » du catalogue ?`))
                      products.remove(product.id);
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
            Aucun bien pour ces critères. Cliquez « Nouveau produit » pour en créer un.
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier le bien" : "Nouveau produit"}
        description="Les biens publiés alimentent la liste « Propriétés & Projets » et la fiche project-details."
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <OcrImport onExtract={applyParsed} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input {...form.register("title")} placeholder="Villa Founty Beach" />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </div>
            <div>
              <Label>Type</Label>
              <Select {...form.register("category")}>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Vente ou location</Label>
              <Select {...form.register("deal")}>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </Select>
            </div>
            <div>
              <Label>Quartier (filtre du site)</Label>
              <Select {...form.register("location")}>
                <option value="founty">Founty</option>
                <option value="marina">Marina</option>
                <option value="taghazout">Taghazout</option>
                <option value="sonaba">Sonaba</option>
                <option value="palmiers">Baie des Palmiers</option>
                <option value="hassan">Hassan II</option>
                <option value="charaf">Charaf</option>
                <option value="hay-mohammadi">Hay Mohammadi</option>
                <option value="zone-industrielle">Zone industrielle</option>
              </Select>
            </div>
            <div>
              <Label>Adresse affichée</Label>
              <Input {...form.register("address")} placeholder="Founty Beach, Agadir" />
            </div>
            <div>
              <Label>Badge (optionnel)</Label>
              <Input {...form.register("badge")} placeholder="Prime Pick, Nouveau…" />
            </div>
            <div>
              <Label>Prix (MAD)</Label>
              <Input type="number" step="10000" {...form.register("price")} />
              <FieldError>{form.formState.errors.price?.message}</FieldError>
            </div>
            <div>
              <Label>Surface (m²)</Label>
              <Input type="number" {...form.register("surface")} />
            </div>
            <div>
              <Label>Chambres</Label>
              <Input type="number" {...form.register("rooms")} />
            </div>
            <div>
              <Label>Salles de bain</Label>
              <Input type="number" {...form.register("baths")} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea {...form.register("description")} className="min-h-24" />
          </div>

          <div>
            <Label>Photo principale (URL ou chemin du site)</Label>
            <Input
              {...form.register("coverUrl")}
              placeholder="assets/images/innerpage/project/project-img1.jpg"
            />
          </div>

          <div>
            <Label>Galerie — une image par ligne</Label>
            <Textarea
              {...form.register("gallery")}
              placeholder={"assets/images/innerpage/project/project-img1.jpg\nassets/images/innerpage/project/p1-hero.jpg"}
              className="min-h-20 font-mono text-[12px]"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-[12.5px] text-ink">
            <input type="checkbox" {...form.register("published")} className="size-4 accent-coral" />
            Publier immédiatement sur le site public
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={products.pending}>
              {editing ? "Enregistrer" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
