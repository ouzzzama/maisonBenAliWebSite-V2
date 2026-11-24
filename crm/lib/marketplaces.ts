/**
 * Portails sur lesquels Maison Benali diffuse ses annonces.
 *
 * `color`  = couleur du logo, reprise telle quelle (repère visuel, graphiques)
 * `tint`   = fond très clair de la colonne du portail
 * `line`   = bordure de cette colonne, un cran plus soutenue que le fond
 */
export const MARKETPLACE_PLATFORMS = [
  {
    value: "airbnb",
    label: "Airbnb",
    hint: "Séjours & conciergerie",
    url: "https://www.airbnb.com",
    color: "#f15c61",
    tint: "linear-gradient(180deg, #fff1f1 0%, #fff7f6 100%)",
    line: "#fbd3d5",
    logo: "/brand/marketplaces/airbnb.svg",
  },
  {
    value: "mubawab",
    label: "Mubawab",
    hint: "Portail immobilier Maroc",
    url: "https://www.mubawab.ma",
    color: "#47a2da",
    tint: "linear-gradient(180deg, #eef7fd 0%, #f6fbfe 100%)",
    line: "#c9e6f7",
    logo: "/brand/marketplaces/mubawab.svg",
  },
  {
    value: "avito",
    label: "Avito",
    hint: "Petites annonces",
    url: "https://www.avito.ma",
    color: "#54ba70",
    /* le logo Avito est tricolore : le fond reprend les trois teintes */
    tint: "linear-gradient(150deg, #fff2f3 0%, #f1faf4 52%, #f1f7fc 100%)",
    line: "#e3d9dd",
    logo: "/brand/marketplaces/avito.svg",
  },
  {
    value: "hespress",
    label: "Hespress Immobilier",
    hint: "Annonces Hespress",
    url: "https://www.hespress.com",
    color: "#2d3186",
    tint: "linear-gradient(180deg, #f1f2fb 0%, #f8f9fd 100%)",
    line: "#d5d7f0",
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

/**
 * Retrouve le portail cité dans un texte libre (« Séjour Airbnb — Villa Founty »).
 * Sert aux transactions déjà saisies, avant que le champ ne soit renseigné.
 */
export function detectPlatform(...values: (string | null | undefined)[]): string {
  const haystack = values.filter(Boolean).join(" ").toLowerCase();
  if (!haystack) return "";
  const hit = MARKETPLACE_PLATFORMS.find(
    (platform) =>
      haystack.includes(platform.label.toLowerCase()) ||
      new RegExp(`\\b${platform.value}\\b`).test(haystack)
  );
  return hit ? hit.value : "";
}

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
