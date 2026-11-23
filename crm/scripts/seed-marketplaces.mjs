/**
 * Annonces de démonstration pour Marketplaces, reliées aux biens publiés.
 *
 *   cd crm && set -a && . ./.env.local && set +a && node scripts/seed-marketplaces.mjs
 *
 * Idempotent : une annonce déjà présente (même portail + même titre) est ignorée.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROOT_SITE = path.resolve(process.cwd(), "..");

/** Les images du site ont été converties en WebP : on suit le fichier réel. */
function siteImage(url) {
  const value = String(url ?? "").trim();
  if (!value || /^(https?:)?\/\//i.test(value)) return value || null;
  if (existsSync(path.join(ROOT_SITE, value))) return value;
  const webp = value.replace(/\.(png|jpe?g|jfif)$/i, ".webp");
  if (webp !== value && existsSync(path.join(ROOT_SITE, webp))) return webp;
  return value;
}

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const LISTINGS = [
  // Airbnb — séjours & conciergerie (prix à la nuit)
  {
    platform: "airbnb",
    title: "Villa Founty Beach — 4 suites avec piscine",
    productId: "pd_villa_founty",
    externalUrl: "https://www.airbnb.com/rooms/48210973",
    status: "published",
    price: 1250,
    views: 486,
    contacts: 23,
    notes: "Séjour minimum 3 nuits · ménage et linge inclus · caution 3 000 MAD.",
    publishedAt: daysAgo(96),
  },
  {
    platform: "airbnb",
    title: "Penthouse Marina Panorama — vue sur le port",
    productId: "pd_marina_penthouse",
    externalUrl: "https://www.airbnb.com/rooms/51937264",
    status: "published",
    price: 980,
    views: 312,
    contacts: 17,
    notes: "2 chambres · terrasse 40 m² · arrivée autonome avec boîte à clés.",
    publishedAt: daysAgo(58),
  },
  {
    platform: "airbnb",
    title: "Résidence Assafa — appartement meublé Hay Mohammadi",
    productId: "cmws9lp1t0002uerstbpggn09",
    externalUrl: "https://www.airbnb.com/rooms/53118402",
    status: "paused",
    price: 420,
    views: 154,
    contacts: 6,
    notes: "Mis en pause le temps des travaux de rafraîchissement de la terrasse.",
    publishedAt: daysAgo(120),
  },

  // Mubawab — portail immobilier (vente et VEFA)
  {
    platform: "mubawab",
    title: "Villa Founty Beach — 350 m², 4 chambres",
    productId: "pd_villa_founty",
    externalUrl: "https://www.mubawab.ma/fr/a/8421157/villa-founty-beach",
    status: "published",
    price: 4200000,
    views: 1240,
    contacts: 38,
    notes: "Annonce sponsorisée · 2 visites programmées cette semaine.",
    publishedAt: daysAgo(74),
  },
  {
    platform: "mubawab",
    title: "Résidence Taghazout Bay — VEFA 2 et 3 pièces",
    productId: "pd_vefa_taghazout",
    externalUrl: "https://www.mubawab.ma/fr/a/8390021/residence-taghazout-bay",
    status: "published",
    price: 1480000,
    views: 890,
    contacts: 27,
    notes: "Livraison T4 2027 · frais de notaire offerts jusqu'à fin du mois.",
    publishedAt: daysAgo(61),
  },
  {
    platform: "mubawab",
    title: "Maison R+2 — Rue Oujda, zone industrielle",
    productId: "cmws9lozd0001uers5hs8bacg",
    externalUrl: "https://www.mubawab.ma/fr/a/8463310/maison-r2-oujda",
    status: "draft",
    price: null,
    views: 64,
    contacts: 1,
    notes: "Prix à confirmer avec le propriétaire avant publication.",
    publishedAt: null,
  },

  // Avito — petites annonces (prix affiché brut)
  {
    platform: "avito",
    title: "Penthouse Marina Panorama — 165 m² vue mer",
    productId: "pd_marina_penthouse",
    externalUrl: "https://www.avito.ma/fr/agadir/appartements/penthouse_marina_11284502",
    status: "published",
    price: 2650000,
    views: 2140,
    contacts: 51,
    notes: "Annonce premium · 3 mois de diffusion achetés.",
    publishedAt: daysAgo(41),
  },
  {
    platform: "avito",
    title: "Magasin 60 m² + mezzanine — Hay Mohammadi",
    productId: "cmws9lotl0000uersfjf0oe4d",
    externalUrl: "https://www.avito.ma/fr/agadir/locaux_commerciaux/magasin_hay_mohammadi_11290118",
    status: "published",
    price: 6500,
    views: 730,
    contacts: 19,
    notes: "Loyer mensuel charges comprises · disponible immédiatement.",
    publishedAt: daysAgo(29),
  },
  {
    platform: "avito",
    title: "Résidence Assafa — appartement 2 chambres meublé",
    productId: "cmws9lp1t0002uerstbpggn09",
    externalUrl: "https://www.avito.ma/fr/agadir/appartements/residence_assafa_11266340",
    status: "paused",
    price: 5500,
    views: 410,
    contacts: 12,
    notes: "En pause : une locataire est en place jusqu'à fin janvier.",
    publishedAt: daysAgo(150),
  },

  // Hespress Immobilier — annonces
  {
    platform: "hespress",
    title: "Résidence Tamourite — Taghazout Bay, 3 pièces",
    productId: "cmws9lp470003uersu2dg759o",
    externalUrl: "https://www.hespress.com/immobilier/annonce/482011",
    status: "published",
    price: 1240000,
    views: 560,
    contacts: 15,
    notes: "Programme neuf · 8 lots restants sur 24.",
    publishedAt: daysAgo(52),
  },
  {
    platform: "hespress",
    title: "Villa Founty Beach — annonce premium expirée",
    productId: "pd_villa_founty",
    externalUrl: "https://www.hespress.com/immobilier/annonce/471928",
    status: "expired",
    price: 4200000,
    views: 3010,
    contacts: 44,
    notes: "Diffusion terminée le mois dernier · à renouveler si le bien est toujours disponible.",
    publishedAt: daysAgo(210),
  },
];

const products = await prisma.product.findMany({ select: { id: true, title: true, coverUrl: true } });
const knownProducts = new Set(products.map((product) => product.id));
const coverByProduct = new Map(products.map((product) => [product.id, product.coverUrl]));

let created = 0;
let skipped = 0;

for (const { platform, title, ...rest } of LISTINGS) {
  if (rest.productId && !knownProducts.has(rest.productId)) {
    console.log(`! bien introuvable (${rest.productId}) pour « ${title} » — annonce non liée`);
    rest.productId = null;
  }
  /* la photo de l'annonce reprend celle du bien lié (modifiable dans le CRM) */
  if (!rest.imageUrl && rest.productId) {
    rest.imageUrl = siteImage(coverByProduct.get(rest.productId));
  }

  const existing = await prisma.marketplaceListing.findFirst({
    where: { platform, title },
    select: { id: true, imageUrl: true, productId: true },
  });
  if (existing) {
    const desired = siteImage(existing.imageUrl ?? coverByProduct.get(existing.productId ?? ""));
    if (desired !== existing.imageUrl) {
      await prisma.marketplaceListing.update({
        where: { id: existing.id },
        data: { imageUrl: desired },
      });
    }
    skipped += 1;
    continue;
  }
  await prisma.marketplaceListing.create({ data: { platform, title, ...rest } });
  created += 1;
  console.log(`+ ${platform.padEnd(8)} ${title}`);
}

const counts = await prisma.marketplaceListing.groupBy({
  by: ["platform"],
  _count: { _all: true },
});

console.log(`\n${created} annonce(s) créée(s), ${skipped} déjà présente(s).`);
console.log(counts.map((row) => `${row.platform}: ${row._count._all}`).join(" · "));

await prisma.$disconnect();
