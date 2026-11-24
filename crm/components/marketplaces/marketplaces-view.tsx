"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodForm } from "@/lib/form";
import { ExternalLink, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/filter-bar";
import { useCollection } from "@/components/admin/use-collection";
import { useSmoothReorder } from "@/components/admin/use-smooth-reorder";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { ImageUploadButton } from "@/components/ui/image-upload";
import { marketplaceSchema, type MarketplaceInput } from "@/lib/validators";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_STATUS_LABEL,
  platformLabel,
  statusLabel,
} from "@/lib/marketplaces";
import type { MarketplaceListing, Product } from "@/lib/demo-data";
import { resolveImage } from "@/lib/images";
import { byPosition, cn, formatMAD } from "@/lib/utils";

/** Carte en cours de déplacement : ancrage au pointeur + inclinaison. */
type DragState = {
  id: string;
  from: string;
  width: number;
  height: number;
  left: number;
  top: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

/** Colonne survolée et rang auquel la carte serait insérée. */
type DropTarget = { platform: string; index: number };

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  draft: "bg-ink/5 text-ink/60 ring-1 ring-inset ring-ink/10",
  paused: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  expired: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/20",
};

const emptyListing: MarketplaceInput = {
  platform: "airbnb",
  title: "",
  imageUrl: "",
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
  /* glisser-déposer au pointeur : la carte suit la souris, opaque, inclinée */
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const dragNodeRef = React.useRef<HTMLElement | null>(null);
  const dragTiltRef = React.useRef(0);
  const dropRef = React.useRef<DropTarget | null>(null);
  const columnRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const dragPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const placeRef = React.useRef<(() => void) | null>(null);

  /* les cartes glissent à leur nouvelle place ; pendant le glisser, l'emplacement
     s'ouvre par les marges, donc pas d'animation FLIP concurrente */
  useSmoothReorder(drag === null);

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
      imageUrl: listing.imageUrl ?? "",
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
      imageUrl: values.imageUrl || null,
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

  /* pose la carte au rang exact prévisualisé, puis enregistre l'ordre de la colonne */
  const moveListing = React.useCallback(
    (listingId: string, platformValue: string, index: number) => {
      const listing = listings.items.find((item) => item.id === listingId);
      if (!listing) return;

      const others = byPosition(
        listings.items.filter(
          (item) => item.platform === platformValue && item.id !== listingId
        )
      );
      const at = Math.max(0, Math.min(index, others.length));
      const ordered = [...others.slice(0, at), listing, ...others.slice(at)];
      const positions = new Map(ordered.map((item, rank) => [item.id, rank * 10]));

      /* la carte atterrit tout de suite au bon rang, sans repasser par son ancienne colonne */
      listings.setItems((current) =>
        current.map((item) => {
          const position = positions.get(item.id);
          if (position === undefined) return item;
          return item.id === listingId
            ? { ...item, platform: platformValue, position }
            : { ...item, position };
        })
      );

      for (const item of ordered) {
        const position = positions.get(item.id) ?? 0;
        const patch: Record<string, unknown> = {};
        if (Number(item.position ?? 0) !== position) patch.position = position;
        if (item.id === listingId) patch.platform = platformValue;
        if (Object.keys(patch).length) {
          void listings.update(item.id, patch).then((row) => {
            if (!row) listings.refresh();
          });
        }
      }
    },
    [listings]
  );

  /* garde le callback à jour sans relancer les écouteurs du glisser-déposer */
  const moveListingRef = React.useRef(moveListing);
  React.useEffect(() => {
    moveListingRef.current = moveListing;
  }, [moveListing]);

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    listing: MarketplaceListing
  ) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    const node = event.currentTarget as HTMLElement;
    const rect = node.getBoundingClientRect();
    const next: DragState = {
      id: listing.id,
      from: listing.platform,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    dragRef.current = next;
    dragNodeRef.current = node;
    dragTiltRef.current = 0;
    dragPointRef.current = { x: event.clientX, y: event.clientY };
    setDrag(next);
    event.preventDefault();
  };

  React.useLayoutEffect(() => {
    if (!drag) return;
    const node = dragNodeRef.current;
    if (!node) return;

    /* la carte suit le pointeur au pixel près, en dehors du cycle de rendu React */
    const place = () => {
      const state = dragRef.current;
      const point = dragPointRef.current;
      const target = dragNodeRef.current;
      /* la carte rendue dans un portail est un nouveau nœud : on réapplique
         toujours la position sur le nœud courant */
      if (!state || !point || !target) return;
      const { x, y } = point;
      const tiltTarget = Math.max(-10, Math.min(10, (x - state.startX) * 0.55));
      dragTiltRef.current += (tiltTarget - dragTiltRef.current) * 0.22;
      /* déplacement exprimé en écart depuis le point d'attrape : le curseur reste
         collé au même endroit de la carte, quel que soit le conteneur */
      target.style.transform = `translate3d(${x - state.startX}px, ${
        y - state.startY
      }px, 0) rotate(${dragTiltRef.current.toFixed(2)}deg)`;
    };
    placeRef.current = place;

    /* première pose avant repeint : la carte ne saute pas au départ */
    place();

    const platformAt = (x: number, y: number) => {
      const hit = Object.entries(columnRefs.current).find(([, element]) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      });
      return hit ? hit[0] : "";
    };

    /* rang d'atterrissage : nombre de cartes dont le milieu est au-dessus du pointeur */
    const indexAt = (element: HTMLElement, y: number) => {
      let index = 0;
      for (const card of Array.from(element.querySelectorAll<HTMLElement>("[data-card-id]"))) {
        const rect = card.getBoundingClientRect();
        if (y > rect.top + rect.height / 2) index += 1;
      }
      return index;
    };

    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      dragPointRef.current = { x: event.clientX, y: event.clientY };
      place();
      const over = platformAt(event.clientX, event.clientY);
      const element = over ? columnRefs.current[over] : null;
      const next: DropTarget | null =
        over && element ? { platform: over, index: indexAt(element, event.clientY) } : null;
      const previous = dropRef.current;
      if (
        (next?.platform ?? "") !== (previous?.platform ?? "") ||
        (next?.index ?? -1) !== (previous?.index ?? -1)
      ) {
        dropRef.current = next;
        setDropTarget(next);
      }
    };

    const finish = () => {
      const current = dragRef.current;
      const target = dropRef.current;
      dragRef.current = null;
      dropRef.current = null;
      if (dragNodeRef.current) dragNodeRef.current.style.transform = "";
      dragNodeRef.current = null;
      dragPointRef.current = null;
      placeRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setDrag(null);
      setDropTarget(null);
      /* hors de toute colonne : la carte revient simplement à sa place */
      if (current && target) {
        moveListingRef.current(current.id, target.platform, target.index);
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [drag !== null]);

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

      {platform ? null : (
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink/55">
          <GripVertical className="size-3.5" />
          Glissez une annonce d&apos;une colonne à l&apos;autre pour changer son portail.
        </p>
      )}

      {/* Un bloc de projets par portail, en colonnes sous les cartes. */}
      <div className={cn("grid gap-3", platform ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4")}>
        {(platform
          ? MARKETPLACE_PLATFORMS.filter((item) => item.value === platform)
          : MARKETPLACE_PLATFORMS
        ).map((column) => {
          const rows = byPosition(
            filtered.filter((listing) => listing.platform === column.value)
          );
          const hovering = drag !== null && dropTarget?.platform === column.value;
          const sourceIndex = drag ? rows.findIndex((row) => row.id === drag.id) : -1;
          const flowCount = rows.length - (sourceIndex >= 0 ? 1 : 0);
          /* emplacement d'atterrissage : dans la colonne survolée, sinon à la place d'origine */
          const insertAt = drag
            ? hovering
              ? Math.min(dropTarget?.index ?? 0, flowCount)
              : drag.from === column.value && sourceIndex >= 0
                ? sourceIndex
                : null
            : null;
          /* ouverture de l'emplacement : hauteur de la carte + l'espace entre cartes */
          const slotSize = drag && insertAt !== null ? drag.height + 8 : 0;
          let flowIndex = 0;
          return (
            <section
              key={column.value}
              ref={(element) => {
                columnRefs.current[column.value] = element;
              }}
              /* chaque colonne reprend le fond clair de son portail (couleurs du logo) */
              style={
                hovering
                  ? undefined
                  : { background: column.tint, borderColor: column.line }
              }
              className={cn(
                "flex flex-col gap-2 rounded-3xl border border-dashed p-2.5 transition",
                hovering
                  ? "border-coral/60 border-solid bg-coral/[0.06] ring-2 ring-coral/25"
                  : ""
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/45">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  Projets diffusés
                </span>
                <span className="rounded-full bg-white px-1.5 text-[10px] font-bold ring-1 ring-inset ring-ink/10">
                  <span style={{ color: column.color }}>{rows.length}</span>
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
                const cover = listing.imageUrl || product?.coverUrl || "";
                const activeDrag = drag && drag.id === listing.id ? drag : null;
                const cardIndex = activeDrag ? -1 : flowIndex;
                if (!activeDrag) flowIndex += 1;
                /* les cartes du dessous glissent pour laisser la place, aucune n'est retirée */
                const slotBefore =
                  slotSize > 0 && insertAt !== null && cardIndex === insertAt ? slotSize : 0;
                const slotAfter =
                  slotSize > 0 &&
                  insertAt !== null &&
                  cardIndex === flowCount - 1 &&
                  insertAt >= flowCount
                    ? slotSize
                    : 0;
                const card = (
                  <article
                    key={listing.id}
                    data-card-id={listing.id}
                    data-flip-id={listing.id}
                    ref={(node) => {
                      if (!node || !activeDrag) return;
                      dragNodeRef.current = node;
                      /* le portail crée un nouveau nœud : on lui redonne tout de suite
                         la position du pointeur, sinon la carte reste figée au départ */
                      placeRef.current?.();
                    }}
                    onPointerDown={(event) => startDrag(event, listing)}
                    style={
                      activeDrag
                        ? {
                            position: "fixed",
                            left: activeDrag.left,
                            top: activeDrag.top,
                            width: activeDrag.width,
                            transformOrigin: `${activeDrag.offsetX}px ${activeDrag.offsetY}px`,
                            margin: 0,
                            zIndex: 60,
                            opacity: 1,
                            pointerEvents: "none",
                            willChange: "transform",
                          }
                        : drag
                          ? {
                              marginTop: slotBefore || undefined,
                              marginBottom: slotAfter || undefined,
                              transition:
                                "margin-top 200ms cubic-bezier(0.22, 1, 0.36, 1), margin-bottom 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }
                          : undefined
                    }
                    className={cn(
                      "flex select-none flex-col gap-2 rounded-2xl border bg-white p-3",
                      activeDrag
                        ? "cursor-grabbing border-coral/50 shadow-2xl ring-2 ring-coral/40"
                        : "cursor-grab border-ink/8 shadow-[0_2px_10px_rgba(18,43,67,0.04)]"
                    )}
                  >
                    {/* vignette carrée à gauche, détails à droite */}
                    <div className="flex items-start gap-2.5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                        {/* poignée visible : la carte se glisse vers un autre portail */}
                        <span
                          aria-hidden="true"
                          title="Glisser vers un autre portail"
                          className="absolute left-1 top-1 z-10 grid size-5 place-items-center rounded-md bg-white/90 text-ink/55 shadow-sm"
                        >
                          <GripVertical className="size-3" />
                        </span>
                        {cover ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resolveImage(cover)}
                            alt={listing.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="grid size-full place-items-center text-[9px] text-ink/30">
                            Sans photo
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
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
                          <p className="mt-0.5 line-clamp-2 text-[10.5px] text-ink/35">
                            {listing.notes}
                          </p>
                        ) : null}
                      </div>
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
                return activeDrag && typeof document !== "undefined"
                  ? createPortal(card, document.body)
                  : card;
              })}
              {/* colonne vide : l'emplacement s'ouvre pour accueillir la carte */}
              {drag && insertAt !== null && flowCount === 0 ? (
                <div
                  aria-hidden="true"
                  className="rounded-2xl border border-dashed border-coral/50 bg-coral/[0.07]"
                  style={{ height: drag.height }}
                />
              ) : null}
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
              <Label>Image de l&apos;annonce</Label>
              <Input {...form.register("imageUrl")} placeholder="assets/images/… ou https://…" />
              <ImageUploadButton
                className="mt-1.5"
                onUploaded={(url) =>
                  form.setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })
                }
              />
              <p className="mt-1 text-[11px] text-muted">
                Photo affichée dans le CRM. Laissée vide, c&apos;est celle du bien lié qui est utilisée.
              </p>
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
