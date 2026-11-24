"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/demo-data";

const mad = (value: number | string | null | undefined) => {
  const number = Number(value);
  if (value === "" || value === null || value === undefined || !Number.isFinite(number) || number <= 0) {
    return "Tarif sur demande";
  }
  return `${new Intl.NumberFormat("fr-MA").format(number)} MAD`;
};

type Draft = {
  dailyRate: string;
  weeklyRate: string;
  highSeasonRate: string;
  seasonNote: string;
  published: boolean;
};

const toDraft = (vehicle: Vehicle): Draft => ({
  dailyRate: vehicle.dailyRate === null || vehicle.dailyRate === undefined ? "" : String(vehicle.dailyRate),
  weeklyRate: vehicle.weeklyRate === null || vehicle.weeklyRate === undefined ? "" : String(vehicle.weeklyRate),
  highSeasonRate:
    vehicle.highSeasonRate === null || vehicle.highSeasonRate === undefined ? "" : String(vehicle.highSeasonRate),
  seasonNote: vehicle.seasonNote ?? "",
  published: vehicle.published !== false,
});

/**
 * Grille tarifaire de la flotte — CRM → Cars → Tarifs.
 *
 * C'est ici que se saisissent les prix affichés sur le site : tarif journée,
 * forfait semaine et tarif haute saison. Un champ laissé vide garde
 * « Tarif sur demande » sur le site.
 */
export function FleetPricing({ initial }: { initial: Vehicle[] }) {
  const [vehicles, setVehicles] = React.useState(initial);
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>(() =>
    Object.fromEntries(initial.map((vehicle) => [vehicle.id, toDraft(vehicle)]))
  );
  const [saving, setSaving] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const setField = (id: string, field: keyof Draft, value: string | boolean) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
    setSaved(null);
  };

  const dirty = (vehicle: Vehicle) => {
    const draft = drafts[vehicle.id];
    if (!draft) return false;
    const base = toDraft(vehicle);
    return (Object.keys(base) as (keyof Draft)[]).some((key) => base[key] !== draft[key]);
  };

  async function save(vehicle: Vehicle) {
    const draft = drafts[vehicle.id];
    if (!draft) return;
    setSaving(vehicle.id);
    setError(null);
    try {
      const payload = {
        id: vehicle.id,
        dailyRate: draft.dailyRate === "" ? null : Number(draft.dailyRate),
        weeklyRate: draft.weeklyRate === "" ? null : Number(draft.weeklyRate),
        highSeasonRate: draft.highSeasonRate === "" ? null : Number(draft.highSeasonRate),
        seasonNote: draft.seasonNote,
        published: draft.published,
      };
      const response = await fetch("/api/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      const updated = (await response.json()) as Vehicle;
      setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDrafts((current) => ({ ...current, [updated.id]: toDraft(updated) }));
      setSaved(updated.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible");
    } finally {
      setSaving(null);
    }
  }

  if (!vehicles.length) {
    return (
      <section className="rounded-2xl border border-black/5 bg-white p-6 text-[13px] text-muted">
        Aucun véhicule dans la flotte. Ajoutez-en un pour saisir ses tarifs.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">Tarifs de la flotte</h2>
        <p className="max-w-3xl text-[12.5px] leading-relaxed text-muted">
          Ces prix alimentent directement les cartes du marché et les fiches véhicule du site. Un champ vide laisse
          « Tarif sur demande ». Journée et semaine en MAD ; la haute saison s&apos;applique selon la note affichée.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</p>
      ) : null}

      <div className="hidden grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.2fr)_auto] gap-3 border-b border-black/5 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted lg:grid">
        <span>Véhicule</span>
        <span>Jour</span>
        <span>Semaine</span>
        <span>Haute saison</span>
        <span>Note saison</span>
        <span />
      </div>

      <ul className="divide-y divide-black/5">
        {vehicles.map((vehicle) => {
          const draft = drafts[vehicle.id] ?? toDraft(vehicle);
          const isDirty = dirty(vehicle);
          return (
            <li
              key={vehicle.id}
              className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.2fr)_auto] lg:items-center"
            >
              <div>
                <p className="text-[14px] font-semibold text-ink">{vehicle.name}</p>
                <p className="text-[11.5px] text-muted">
                  {vehicle.category}
                  {draft.published ? "" : " · masqué du site"}
                </p>
              </div>

              {(["dailyRate", "weeklyRate", "highSeasonRate"] as const).map((field) => (
                <label key={field} className="grid gap-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted lg:hidden">
                    {field === "dailyRate" ? "Jour" : field === "weeklyRate" ? "Semaine" : "Haute saison"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    inputMode="numeric"
                    value={draft[field]}
                    onChange={(event) => setField(vehicle.id, field, event.target.value)}
                    placeholder="—"
                    className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-[13px] text-ink outline-none focus:border-coral"
                  />
                  <span className="text-[10.5px] text-muted">{mad(draft[field])}</span>
                </label>
              ))}

              <label className="grid gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted lg:hidden">
                  Note saison
                </span>
                <input
                  type="text"
                  value={draft.seasonNote}
                  onChange={(event) => setField(vehicle.id, "seasonNote", event.target.value)}
                  placeholder="Juillet, août, fêtes"
                  className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-[12.5px] text-ink outline-none focus:border-coral"
                />
              </label>

              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <label className="flex items-center gap-2 text-[11.5px] text-muted">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(event) => setField(vehicle.id, "published", event.target.checked)}
                    className="size-4 accent-[#ef453b]"
                  />
                  En ligne
                </label>
                <Button type="button" onClick={() => save(vehicle)} disabled={!isDirty || saving === vehicle.id}>
                  {saving === vehicle.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : saved === vehicle.id ? (
                    <Check className="size-4" />
                  ) : null}
                  {saved === vehicle.id ? "Enregistré" : "Enregistrer"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
