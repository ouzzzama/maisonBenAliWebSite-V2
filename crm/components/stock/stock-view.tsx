"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Car, FolderKanban, Home, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsView } from "@/components/products/products-view";
import { CarsView } from "@/components/cars/cars-view";
import { PRODUCT_CATEGORIES, normalizeCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { CarRental, Product } from "@/lib/demo-data";

/**
 * Un seul écran pour les catalogues du groupe. Les boutons de bascule
 * remplacent les entrées qu'occupaient auparavant le menu latéral, et une
 * seconde rangée filtre par catégorie de bien.
 */
const TABS = [
  { key: "vente", label: "Vente", icon: Home },
  { key: "location", label: "Location", icon: KeyRound },
  { key: "cars", label: "Benali Cars", icon: Car },
] as const;

type StockTab = (typeof TABS)[number]["key"];

export function StockView({ products, rentals }: { products: Product[]; rentals: CarRental[] }) {
  const [active, setActive] = React.useState<StockTab>("vente");
  const [category, setCategory] = React.useState("");

  const counts: Record<StockTab, number> = {
    vente: products.filter((product) => product.deal !== "location").length,
    location: products.filter((product) => product.deal === "location").length,
    cars: rentals.length,
  };

  const dealProducts = products.filter((product) =>
    active === "location" ? product.deal === "location" : product.deal !== "location"
  );

  const categoryCount = (value: string) =>
    value
      ? dealProducts.filter((product) => normalizeCategory(product.category) === value).length
      : dealProducts.length;

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Catalogue"
        title="Gestion de stock"
        description="Biens à vendre, biens à louer et Benali Cars sur une seule page : basculez de catalogue avec les boutons, puis affinez par catégorie de bien."
        actions={
          <>
            <Link
              href="/admin/projects"
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ink/12 bg-white px-3 py-2 text-[12px] font-medium text-ink/65 transition hover:border-ink/25 hover:text-ink"
            >
              <FolderKanban className="size-3.5" /> Projets VEFA
            </Link>
            <Link
              href="/admin/bookings"
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ink/12 bg-white px-3 py-2 text-[12px] font-medium text-ink/65 transition hover:border-ink/25 hover:text-ink"
            >
              <CalendarDays className="size-3.5" /> Réservations
            </Link>
          </>
        }
      />

      <div
        role="tablist"
        aria-label="Catalogues de stock"
        className="mb-3 inline-flex w-full flex-wrap items-center gap-1 rounded-2xl border border-ink/10 bg-white p-1 shadow-[0_2px_10px_rgba(18,43,67,0.04)] sm:w-auto"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.key)}
              className={cn(
                "focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition sm:flex-none",
                selected
                  ? "bg-coral text-white shadow-[0_10px_22px_-16px_rgba(239,69,59,0.95)]"
                  : "text-ink/55 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {tab.label}
              <span
                className={cn(
                  "grid min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold",
                  selected ? "bg-white/22 text-white" : "bg-ink/8 text-ink/55"
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {active !== "cars" ? (
        <div
          role="group"
          aria-label="Catégorie de bien"
          className="mb-4 flex flex-wrap items-center gap-1.5"
        >
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/40">
            Catégorie
          </span>
          {[{ value: "", label: "Toutes" }, ...PRODUCT_CATEGORIES].map((option) => {
            const selected = category === option.value;
            const count = categoryCount(option.value);
            return (
              <button
                key={option.value || "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(option.value)}
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
      ) : null}

      <div role="tabpanel">
        {active === "vente" ? (
          <ProductsView
            key={`vente-${category}`}
            initial={products}
            initialDeal="vente"
            initialCategory={category}
            embedded
          />
        ) : null}
        {active === "location" ? (
          <ProductsView
            key={`location-${category}`}
            initial={products}
            initialDeal="location"
            initialCategory={category}
            embedded
          />
        ) : null}
        {active === "cars" ? <CarsView initial={rentals} embedded /> : null}
      </div>
    </div>
  );
}
