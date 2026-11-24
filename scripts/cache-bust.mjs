/* Cache-busting automatique des CSS/JS du site Maison Benali.
 *
 *   node scripts/cache-bust.mjs          → réécrit les ?v= avec le hash du fichier
 *   node scripts/cache-bust.mjs --check  → ne touche à rien, sort en 1 si un
 *                                          hash est périmé (utilisé en CI)
 *
 * Le hash est calculé sur le contenu du fichier : dès qu'un CSS ou un JS
 * change, son ?v= change tout seul, sans plus jamais bumper à la main.
 * Le script est idempotent : relancé sans modification, il n'écrit rien.
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");

/* Seuls les fichiers réellement servis par le site sont traités. */
const htmlFiles = readdirSync(ROOT)
  .filter((name) => name.endsWith(".html"))
  .sort();

const ASSET_REF = /((?:href|src)=")([^"?#]+?\.(?:css|js))(?:\?v=([^"]*))?(")/g;

const hashes = new Map();
function assetHash(relative) {
  if (hashes.has(relative)) return hashes.get(relative);
  const clean = relative.replace(/^\.?\//, "");
  const absolute = path.join(ROOT, clean);
  let hash = null;
  try {
    hash = createHash("sha256").update(readFileSync(absolute)).digest("hex").slice(0, 10);
  } catch {
    hash = null; // fichier absent (CDN, ancien nom) : on laisse la référence telle quelle
  }
  hashes.set(relative, hash);
  return hash;
}

let changedFiles = 0;
let stale = 0;
const report = [];

for (const file of htmlFiles) {
  const absolute = path.join(ROOT, file);
  const before = readFileSync(absolute, "utf8");
  let touched = false;

  const after = before.replace(ASSET_REF, (match, prefix, url, current, suffix) => {
    if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return match;
    const hash = assetHash(url);
    if (!hash) return match;
    if (current === hash) return match;
    touched = true;
    report.push(`${file}: ${url} ${current ? `v=${current}` : "(sans version)"} → ${hash}`);
    return `${prefix}${url}?v=${hash}${suffix}`;
  });

  if (touched) {
    changedFiles += 1;
    stale += 1;
    if (!CHECK_ONLY) writeFileSync(absolute, after);
  }
}

for (const line of report) console.log(line);
console.log(
  CHECK_ONLY
    ? `cache-busting : ${changedFiles} fichier(s) HTML avec un hash périmé`
    : `cache-busting : ${changedFiles} fichier(s) HTML mis à jour, ${hashes.size} asset(s) hachés`
);

if (CHECK_ONLY && stale > 0) {
  console.error("Hash périmé : lancez `npm run assets:hash` puis commitez.");
  process.exit(1);
}
