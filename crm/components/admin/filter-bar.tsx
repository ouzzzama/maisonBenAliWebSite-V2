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
  const activeCount = Object.values(values).filter(Boolean).length + (query ? 1 : 0);

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2.5 rounded-3xl border border-ink/8 bg-white p-3 shadow-[0_2px_10px_rgba(18,43,67,0.04)] lg:flex-row lg:items-center",
        className
      )}
    >
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="pl-9"
          aria-label={placeholder}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={values[filter.key] ?? ""}
            onChange={(event) => onFilterChange(filter.key, event.target.value)}
            aria-label={filter.label}
            className="h-10 w-auto min-w-[140px] text-[12.5px]"
          >
            <option value="">{filter.label} : tous</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
      </div>

      {extra ? <div className="lg:ml-auto">{extra}</div> : null}
    </div>
  );
}
