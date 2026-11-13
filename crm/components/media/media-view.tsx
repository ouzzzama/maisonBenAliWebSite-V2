"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { Copy, ImagePlus, Pencil, Trash2, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { mediaSchema, type MediaInput } from "@/lib/validators";
import type { MediaAsset } from "@/lib/demo-data";
import { PAGE_SLOT_LABEL, cn, formatDate } from "@/lib/utils";

const SLOT_OPTIONS = Object.entries(PAGE_SLOT_LABEL).map(([value, label]) => ({ value, label }));

const emptyMedia: MediaInput = {
  url: "",
  filename: "",
  alt: "",
  pageSlot: "HOME_HERO",
  sectionKey: "",
  sortOrder: 1,
  active: true,
};

export function MediaView({ initial }: { initial: MediaAsset[] }) {
  const media = useCollection<MediaAsset>("/api/media", initial);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({ pageSlot: "" });
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MediaAsset | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  const form = useForm<MediaInput>({
    resolver: zodForm(mediaSchema),
    defaultValues: emptyMedia,
  });

  const openCreate = () => {
    setEditing(null);
    setPreview(null);
    form.reset(emptyMedia);
    setOpen(true);
  };

  const openEdit = (asset: MediaAsset) => {
    setEditing(asset);
    setPreview(asset.url);
    form.reset({
      url: asset.url,
      filename: asset.filename,
      alt: asset.alt ?? "",
      pageSlot: asset.pageSlot,
      sectionKey: asset.sectionKey ?? "",
      sortOrder: asset.sortOrder,
      active: asset.active,
    });
    setOpen(true);
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setPreview(result);
      form.setValue("url", result);
      form.setValue("filename", file.name);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: MediaInput) => {
    const payload = {
      ...values,
      filename: values.filename || values.url.split("/").pop() || "image",
      size: 0,
      mimeType: values.url.startsWith("data:image/png") ? "image/png" : "image/jpeg",
    };
    const result = editing
      ? await media.update(editing.id, payload)
      : await media.create(payload);
    if (result) {
      setOpen(false);
      form.reset(emptyMedia);
      setPreview(null);
    }
  };

  const assignSlot = async (asset: MediaAsset, pageSlot: string) => {
    await media.update(asset.id, { pageSlot, sectionKey: asset.sectionKey ?? null });
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return media.items.filter((asset) => {
      if (filters.pageSlot && asset.pageSlot !== filters.pageSlot) return false;
      if (!term) return true;
      return [asset.filename, asset.alt, asset.sectionKey]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [media.items, query, filters]);

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="CMS"
        title="Médias & images dynamiques"
        description="Une seule bibliothèque ; chaque image est rattachée à un emplacement public via une clé CMS."
        actions={
          <Button variant="coral" onClick={openCreate}>
            <ImagePlus className="size-4" /> Ajouter une image
          </Button>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SLOT_OPTIONS.slice(0, 4).map((slot) => {
          const asset = media.items.find((item) => item.pageSlot === slot.value && item.active);
          return (
            <div
              key={slot.value}
              className="overflow-hidden rounded-2xl border border-ink/8 bg-white"
            >
              <div className="aspect-[16/9] bg-cream">
                {asset ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.alt ?? slot.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[11px] text-ink/30">
                    Aucune image
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/40">
                  {slot.label}
                </p>
                <p className="truncate text-[11.5px] font-medium text-ink">
                  {asset ? asset.filename : "—"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Nom de fichier, alt, clé…"
        values={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => {
          setQuery("");
          setFilters({ pageSlot: "" });
        }}
        filters={[{ key: "pageSlot", label: "Emplacement", options: SLOT_OPTIONS }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
          >
            <div className="relative aspect-[4/3] bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.alt ?? asset.filename}
                className={cn("h-full w-full object-cover", !asset.active && "opacity-40 grayscale")}
              />
              <div className="absolute left-2 top-2 flex gap-1">
                <Pill className="bg-white/90 text-ink/70 backdrop-blur">
                  {PAGE_SLOT_LABEL[asset.pageSlot]}
                </Pill>
              </div>
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  title="Copier l'URL"
                  onClick={() => navigator.clipboard?.writeText(asset.url)}
                  className="grid size-7 place-items-center rounded-lg bg-white/90 text-ink/60 backdrop-blur transition hover:text-ink"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Modifier"
                  onClick={() => openEdit(asset)}
                  className="grid size-7 place-items-center rounded-lg bg-white/90 text-ink/60 backdrop-blur transition hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${asset.filename} » ?`)) media.remove(asset.id);
                  }}
                  className="grid size-7 place-items-center rounded-lg bg-white/90 text-rose-500 backdrop-blur"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3">
              <p className="truncate text-[12.5px] font-semibold text-ink">{asset.filename}</p>
              <p className="truncate text-[11px] text-muted">{asset.alt ?? "Sans description"}</p>

              <div className="mt-2.5">
                <Label className="mb-1">Emplacement public</Label>
                <Select
                  value={asset.pageSlot}
                  onChange={(event) => assignSlot(asset, event.target.value)}
                  className="h-9 text-[12px]"
                >
                  {SLOT_OPTIONS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10.5px] text-ink/45">
                <span>{formatDate(asset.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => media.update(asset.id, { active: !asset.active })}
                  className={cn(
                    "rounded-full px-2 py-0.5 font-semibold transition",
                    asset.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-ink/5 text-ink/50"
                  )}
                >
                  {asset.active ? "En ligne" : "Masquée"}
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-ink/12 bg-white/60 p-12 text-center text-[13px] text-muted">
            Aucune image pour ces critères.
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'image" : "Ajouter une image"}
        description="Déposez un fichier (stocké en data-URL dans la démo) ou collez une URL publique."
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-cream/60 px-4 py-8 text-center transition hover:border-coral/40">
            <UploadCloud className="size-6 text-coral" />
            <span className="text-[12.5px] font-medium text-ink">
              Choisir un fichier image
            </span>
            <span className="text-[11px] text-muted">JPG, PNG, WebP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
          </label>

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Aperçu"
              className="h-40 w-full rounded-2xl object-cover"
            />
          ) : null}

          <div>
            <Label>URL de l&apos;image</Label>
            <Input {...form.register("url")} placeholder="https://… ou /media/home/hero.jpg" />
            <FieldError>{form.formState.errors.url?.message}</FieldError>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Emplacement</Label>
              <Select {...form.register("pageSlot")}>
                {SLOT_OPTIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Clé CMS</Label>
              <Input {...form.register("sectionKey")} placeholder="home.hero" />
            </div>
            <div>
              <Label>Texte alternatif</Label>
              <Input {...form.register("alt")} placeholder="Description pour l'accessibilité" />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input type="number" {...form.register("sortOrder")} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="coral" disabled={media.pending}>
              {editing ? "Enregistrer" : "Ajouter à la bibliothèque"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
