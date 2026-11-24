/* Prépare le dossier `dist/` publié sur Hostinger.
 *
 *   node scripts/build-site.mjs
 *
 * On ne publie que ce qui est réellement servi par le site vitrine :
 * les pages HTML de la racine, `assets/`, robots.txt, sitemap.xml et .htaccess.
 * Le dossier `crm/` (code du CRM), `server.js`, `launcher/` et les fichiers
 * .md/.txt ne partent jamais chez l'hébergeur : rien à divulguer, rien à
 * nettoyer côté FTP.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

/* Tout ce qui doit être en ligne, et rien d'autre. */
const FILES = ["robots.txt", "sitemap.xml", ".htaccess"];
const DIRS = ["assets"];
const PAGE_REF = /(?:href|src)="([^"?#]+?\.(?:css|js))(?:\?v=[^"]*)?"/g;

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const pages = readdirSync(ROOT).filter((name) => name.endsWith(".html"));
for (const page of pages) cpSync(path.join(ROOT, page), path.join(DIST, page));

for (const file of FILES) {
  if (existsSync(path.join(ROOT, file))) cpSync(path.join(ROOT, file), path.join(DIST, file));
}

for (const dir of DIRS) {
  if (existsSync(path.join(ROOT, dir))) {
    cpSync(path.join(ROOT, dir), path.join(DIST, dir), {
      recursive: true,
      filter: (source) => !source.includes(`${path.sep}node_modules`),
    });
  }
}

/* Garde-fou : une page ne doit pas pointer vers un CSS/JS absent du dist. */
const missing = new Set();
for (const page of pages) {
  const html = readFileSync(path.join(DIST, page), "utf8");
  for (const match of html.matchAll(PAGE_REF)) {
    const url = match[1];
    if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) continue;
    const target = path.join(DIST, url.replace(/^\.?\//, ""));
    if (!existsSync(target)) missing.add(`${page} → ${url}`);
  }
}
if (missing.size) {
  console.error("Références introuvables :");
  for (const line of missing) console.error(`  - ${line}`);
  process.exit(1);
}

/* Poids total, pour repérer un envoi anormal. */
let total = 0;
let files = 0;
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else {
      total += statSync(absolute).size;
      files += 1;
    }
  }
};
walk(DIST);

console.log(
  `dist/ prêt : ${pages.length} page(s), ${files} fichier(s), ${(total / 1024 / 1024).toFixed(1)} Mo`
);
