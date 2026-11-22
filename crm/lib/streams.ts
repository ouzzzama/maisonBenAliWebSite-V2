/**
 * Secteurs d'activité utilisés pour rattacher une transaction à son revenu.
 * Les clés `booking`, `rental`, `project` et `other` existent déjà en base :
 * ne pas les renommer, seulement ajouter `sale` (vente immobilière) et `shop`.
 */
export const STREAMS = [
  { key: "sale", label: "Vente immobilière", color: "#ef453b" },
  { key: "project", label: "VEFA / Projets neufs", color: "#15483d" },
  { key: "booking", label: "Location immobilière", color: "#122b43" },
  { key: "rental", label: "Benali Cars", color: "#c99a3e" },
  { key: "shop", label: "Boutique", color: "#7a6f9b" },
  { key: "other", label: "Autres", color: "#c9c2b4" },
] as const;

export type StreamKey = (typeof STREAMS)[number]["key"];

export const STREAM_OPTIONS = STREAMS.map((stream) => ({
  value: stream.key,
  label: stream.label,
}));

export const STREAM_LABEL: Record<string, string> = STREAMS.reduce(
  (labels, stream) => ({ ...labels, [stream.key]: stream.label }),
  {} as Record<string, string>
);

/** Clé de secteur valide pour une transaction (valeur inconnue → « other »). */
export function normalizeStream(value: string | null | undefined): StreamKey {
  const found = STREAMS.find((stream) => stream.key === value);
  return found ? found.key : "other";
}

export function streamLabel(value: string | null | undefined) {
  if (!value) return "—";
  return STREAM_LABEL[value] ?? value;
}
