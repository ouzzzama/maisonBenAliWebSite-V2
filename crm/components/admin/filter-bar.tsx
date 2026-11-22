"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type FilterConfig = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full bg-ink/6 pl-2.5 pr-1 text-[11.5px] font-medium text-ink/75">
      <span className="truncate">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer ce filtre"
        className="focus-ring grid size-5 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-ink/15 hover:text-ink"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder = "Rechercher…",
  filters = [],
  values,
  onFilterChange,
  onReset,
  extra,
  className,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onReset?: () => void;
  extra?: React.ReactNode;
  className?: string;
}) {
  const activeFilters = filters.filter((filter) => Boolean(values[filter.key]));
  const activeCount = activeFilters.length + (query ? 1 : 0);

  const optionLabel = (filter: FilterConfig, value: string) =>
    filter.options.find((option) => option.value === value)?.label ?? value;

  return (
    <div
      className={cn(
        "mb-4 rounded-3xl border border-ink/8 bg-white p-3 shadow-[0_2px_10px_rgba(18,43,67,0.04)]",
        className
      )}
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative lg:w-72 lg:shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 pl-9 pr-9"
            aria-label={placeholder}
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Effacer la recherche"
              className="focus-ring absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink/40 transition hover:bg-ink/8 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {filters.map((filter) => (
            <div key={filter.key} className="w-[168px] shrink-0">
              <Select
                value={values[filter.key] ?? ""}
                onChange={(event) => onFilterChange(filter.key, event.target.value)}
                aria-label={filter.label}
                className="h-10 text-[12.5px]"
              >
                <option value="">{filter.label} : tous</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}

          {activeCount > 0 && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-ink/12 px-3 text-[12px] font-medium text-ink/60 transition hover:border-ink/25 hover:text-ink"
            >
              <X className="size-3.5" />
              Réinitialiser
              <span className="grid size-4 place-items-center rounded-full bg-ink/8 text-[9.5px] font-bold">
                {activeCount}
              </span>
            </button>
          ) : (
            <span className="hidden items-center gap-1.5 px-1 text-[11px] text-ink/35 lg:inline-flex">
              <SlidersHorizontal className="size-3.5" /> Filtres
            </span>
          )}

          {extra ? <div className="lg:ml-1">{extra}</div> : null}
        </div>
      </div>

      {activeCount > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-ink/6 pt-2.5">
          <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink/35">
            Actifs
          </span>
          {query ? <Chip onRemove={() => onQueryChange("")}>« {query} »</Chip> : null}
          {activeFilters.map((filter) => (
            <Chip key={filter.key} onRemove={() => onFilterChange(filter.key, "")}>
              {filter.label} : {optionLabel(filter, values[filter.key])}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
