/**
 * Portails sur lesquels Maison Benali diffuse ses annonces. Les libellés sont
 * partagés par le CRM et les formulaires ; `color` sert de repère visuel.
 */
export const MARKETPLACE_PLATFORMS = [
  {
    value: "airbnb",
    label: "Airbnb",
    hint: "Séjours & conciergerie",
    url: "https://www.airbnb.com",
    color: "#ff5a5f",
    logo: "/brand/marketplaces/airbnb.svg",
  },
  {
    value: "mubawab",
    label: "Mubawab",
    hint: "Portail immobilier Maroc",
    url: "https://www.mubawab.ma",
    color: "#f5a623",
    logo: "/brand/marketplaces/mubawab.svg",
  },
  {
    value: "avito",
    label: "Avito",
    hint: "Petites annonces",
    url: "https://www.avito.ma",
    color: "#7c5cff",
    logo: "/brand/marketplaces/avito.svg",
  },
  {
    value: "hespress",
    label: "Hespress Immobilier",
    hint: "Annonces Hespress",
    url: "https://www.hespress.com",
    color: "#e11d48",
    logo: "/brand/marketplaces/hespress.svg",
  },
] as const;

export type MarketplacePlatform = (typeof MARKETPLACE_PLATFORMS)[number]["value"];

export const MARKETPLACE_PLATFORM_VALUES = MARKETPLACE_PLATFORMS.map(
  (platform) => platform.value
) as [MarketplacePlatform, ...MarketplacePlatform[]];

export const MARKETPLACE_PLATFORMS_LABEL: Record<string, string> = MARKETPLACE_PLATFORMS.reduce<
  Record<string, string>
>((labels, platform) => {
  labels[platform.value] = platform.label;
  return labels;
}, {});

export const MARKETPLACE_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  published: "En ligne",
  paused: "En pause",
  expired: "Expirée",
};

export function platformLabel(value?: string | null): string {
  return MARKETPLACE_PLATFORMS_LABEL[String(value ?? "")] ?? String(value ?? "—");
}

export function platformColor(value?: string | null): string {
  const platform = MARKETPLACE_PLATFORMS.find((item) => item.value === value);
  return platform ? platform.color : "#122b43";
}

export function statusLabel(value?: string | null): string {
  return MARKETPLACE_STATUS_LABEL[String(value ?? "")] ?? "Brouillon";
}

export function platformInitial(value?: string | null): string {
  return platformLabel(value).trim().charAt(0).toUpperCase();
}

/** Logo officiel du portail (fichier local, voir /public/brand/marketplaces). */
export function platformLogo(value?: string | null): string {
  const platform = MARKETPLACE_PLATFORMS.find((item) => item.value === value);
  return platform ? platform.logo : "";
}
