/**
 * Lecture d'une annonce / affiche photographiée : le texte reconnu (OCR) est
 * transformé en champs du formulaire produit. Les heuristiques sont volontaire-
 * ment tolérantes — le commercial garde toujours la main sur ce qui est proposé.
 */

export type ParsedListing = {
  title?: string;
  price?: number;
  surface?: number;
  rooms?: number;
  baths?: number;
  address?: string;
  location?: string;
  category?: string;
  deal?: "vente" | "location";
  phone?: string;
  reference?: string;
};

const CATEGORY_KEYWORDS: Array<[string, RegExp]> = [
  ["riad", /\briad\b|\bryad\b/i],
  ["studio", /\bstudio\b|\bstudio\s+meubl/i],
  ["appartement", /\bappartements?\b|\bappart\b|\bpenthouse\b|\bduplex\b/i],
  ["villa", /\bvillas?\b|\bdemeures?\b|\bchalet\b/i],
  ["maison", /\bmaisons?\b/i],
  ["terrain", /\bterrains?\b|\bfoncier\b|\blotissement\b/i],
  ["bureau", /\bbureaux\b|\bbureau\b|\bplateau\b|\bopen\s?space\b/i],
  ["commerce", /\bcommerce\b|\bcommercial\b|\bmagasin\b|\bshowroom\b|\blocal\b/i],
  ["projets-neufs", /\bvefa\b|\bneufs?\b|\bprogramme\s+neuf\b|\bsur\s+plan\b/i],
];

const LOCATION_KEYWORDS: Array<[string, RegExp]> = [
  ["founty", /founty|founty\s+beach|baie\s+des\s+palmiers|palmiers/i],
  ["marina", /marina|port\s+d.?agadir/i],
  ["taghazout", /taghazout|taghazout\s+bay/i],
  ["sonaba", /sonaba/i],
  ["palmiers", /palmiers/i],
  ["hassan", /hassan\s+ii|bd\s+hassan/i],
  ["charaf", /charaf|charaf\s+cliff/i],
];

const CATEGORY_LABEL: Record<string, string> = {
  appartement: "Appartement",
  villa: "Villa",
  maison: "Maison",
  riad: "Riad",
  studio: "Studio",
  terrain: "Terrain",
  bureau: "Bureau",
  commerce: "Commerce",
  "projets-neufs": "Projets neufs",
};

export function categoryLabel(slug?: string): string | undefined {
  return slug ? CATEGORY_LABEL[slug] : undefined;
}

function cleanNumber(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function readable(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[|]+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findPrice(text: string): number | undefined {
  const withCurrency = text.match(
    /([0-9][0-9\s.,]{2,})\s*(?:mad|dhs?|dirhams?|درهم|dh\b)/i
  );
  if (withCurrency) {
    const value = cleanNumber(withCurrency[1]);
    if (value >= 1000) return value;
  }
  // un prix peut aussi s'écrire sans devise : 1 250 000 / 1.250.000
  const groups = text.match(/\b\d{1,3}(?:[ .]\d{3}){2,}\b|\b\d{6,}\b/g);
  if (groups) {
    const values = groups.map(cleanNumber).filter((value) => value >= 100000);
    if (values.length) return Math.max(...values);
  }
  return undefined;
}

function findSurface(text: string): number | undefined {
  const match = text.match(/(\d{1,4})\s*(?:m2|m²|m\^2|metres?\s*carres?|mètres?\s*carrés?)/i);
  if (match) {
    const value = Number(match[1]);
    if (value >= 10 && value <= 20000) return value;
  }
  return undefined;
}

function findRooms(text: string): number | undefined {
  const match = text.match(/(\d{1,2})\s*(?:chambres?|pieces?|pièces?|ch\b)/i);
  return match ? Number(match[1]) : undefined;
}

function findBaths(text: string): number | undefined {
  const match = text.match(/(\d{1,2})\s*(?:salles?\s*de\s*bains?|sdb|bains?)/i);
  return match ? Number(match[1]) : undefined;
}

function findPhone(text: string): string | undefined {
  const match = text.match(/(\+?\d[\d\s.\-()]{8,}\d)/);
  if (!match) return undefined;
  const digits = match[1].replace(/[^\d+]/g, "");
  return digits.length >= 9 ? digits : undefined;
}

function findReference(text: string): string | undefined {
  const match = text.match(/\b(?:ref|réf|reference|référence)\s*[:#]?\s*([A-Z0-9-]{3,12})/i);
  return match ? match[1].toUpperCase() : undefined;
}

function findTitle(lines: string[]): string | undefined {
  const pool = lines.slice(0, 10).map((line) => line.replace(/\s+/g, " ").replace(/^[-–•\s]+/, "").trim());
  const letters = (line: string) => (line.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  // une accroche de titre : des mots, pas de chiffres (prix, surfaces, chambres)
  const clean = pool.filter(
    (line) => line.length >= 10 && line.length <= 90 && letters(line) >= 8 && !/\d/.test(line)
  );
  if (clean.length) return clean[0];
  return pool.find((line) => line.length >= 10 && line.length <= 90 && letters(line) >= 8);
}

function findAddress(lines: string[], title?: string): string | undefined {
  const candidates = lines.filter(
    (line) =>
      line !== title &&
      line.length <= 90 &&
      /\b(?:agadir|taghazout|founty|marina|sonaba|charaf|palmiers|hassan|maroc)\b/i.test(line) &&
      !/\b(?:dh|mad|m2|m²|chambres?|sdb)\b/i.test(line)
  );
  const pick = candidates[candidates.length - 1] ?? candidates[0];
  return pick ? pick.replace(/\s+/g, " ").trim() : undefined;
}

export function parseListingText(raw: string): ParsedListing {
  const text = readable(raw);
  if (!text) return {};
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const flat = text.replace(/\n/g, " ");

  const deal: ParsedListing["deal"] = /(à\s+louer|a\s+louer|location|louer|rent)/i.test(flat)
    ? "location"
    : /(à\s+vendre|a\s+vendre|vente|vendre|sell)/i.test(flat)
      ? "vente"
      : undefined;

  const category = CATEGORY_KEYWORDS.find(([, pattern]) => pattern.test(flat))?.[0];
  const location = LOCATION_KEYWORDS.find(([, pattern]) => pattern.test(flat))?.[0];
  const title = findTitle(lines);

  return {
    title,
    price: findPrice(text),
    surface: findSurface(text),
    rooms: findRooms(text),
    baths: findBaths(text),
    address: findAddress(lines, title),
    location,
    category,
    deal,
    phone: findPhone(text),
    reference: findReference(text),
  };
}
