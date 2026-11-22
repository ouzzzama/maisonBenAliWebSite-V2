/**
 * Catégories de biens partagées par le CRM et le site public.
 *
 * Les anciens slugs (villas, appartements, vefa, commercial) restent lisibles :
 * normalizeCategory() les ramène sur la valeur courante, si bien qu'un bien
 * enregistré avant ce changement peut toujours être modifié dans le CRM.
 */

export const PRODUCT_CATEGORIES = [
  { value: "appartement", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "maison", label: "Maison" },
  { value: "riad", label: "Riad" },
  { value: "studio", label: "Studio" },
  { value: "terrain", label: "Terrain" },
  { value: "bureau", label: "Bureau" },
  { value: "commerce", label: "Commerce" },
  { value: "projets-neufs", label: "Projets neufs" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

export const PRODUCT_CATEGORY_SLUGS: [ProductCategory, ...ProductCategory[]] = [
  "appartement",
  "villa",
  "maison",
  "riad",
  "studio",
  "terrain",
  "bureau",
  "commerce",
  "projets-neufs",
];

const LEGACY_CATEGORY: Record<string, ProductCategory> = {
  villas: "villa",
  appartements: "appartement",
  vefa: "projets-neufs",
  commercial: "commerce",
};

/** Libellés affichés, y compris pour les anciens slugs encore en base. */
export const CATEGORY_LABEL: Record<string, string> = {
  ...PRODUCT_CATEGORIES.reduce<Record<string, string>>((labels, category) => {
    labels[category.value] = category.label;
    return labels;
  }, {}),
  villas: "Villa",
  appartements: "Appartement",
  vefa: "Projets neufs",
  commercial: "Commerce",
};

/** Ramène une valeur héritée (ou vide) sur un slug actuel. */
export function normalizeCategory(value?: string | null): ProductCategory | "" {
  const slug = String(value ?? "").trim();
  if (!slug) return "";
  if (LEGACY_CATEGORY[slug]) return LEGACY_CATEGORY[slug];
  const known = PRODUCT_CATEGORIES.find((category) => category.value === slug);
  return known ? known.value : "";
}

/** Le slug utilisable dans le CRM (valeur par défaut si inconnue). */
export function categoryOrFallback(value?: string | null): ProductCategory {
  return normalizeCategory(value) || "appartement";
}
