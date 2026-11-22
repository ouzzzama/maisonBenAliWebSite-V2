/**
 * Les chemins d'images saisis dans le CRM (« assets/images/… ») pointent vers le
 * site public, pas vers le CRM : sans préfixe, la vignette se casse dans
 * l'admin (port 3002) alors que la fiche publique l'affiche correctement.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.WEBSITE_ORIGIN ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export function resolveImage(src?: string | null): string {
  const value = String(src ?? "").trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (/^(data|blob):/i.test(value)) return value;
  return `${SITE_URL}/${value.replace(/^\.?\//, "")}`;
}
