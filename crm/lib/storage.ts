import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

/**
 * Stockage des images envoyées depuis le CRM.
 *
 * En production, les fichiers partent sur l'hébergement Hostinger par FTP et
 * sont servis directement par le site vitrine : l'URL renvoyée est donc une
 * vraie URL publique du panneau Fichiers (public_html), pas une data-URL en
 * base — le site reste léger et les images sont mises en cache par le
 * navigateur et le CDN Hostinger.
 *
 * Sans identifiants FTP, on retombe sur un dossier local `.uploads/` servi par
 * `/uploads/<fichier>` : le développement fonctionne sans configuration.
 */

const PUBLIC_BASE = (process.env.MEDIA_PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
const REMOTE_DIR = (process.env.HOSTINGER_FTP_DIR ?? "/public_html/uploads/crm")
  .trim()
  .replace(/\/+$/, "");

const FTP_HOST = (process.env.HOSTINGER_FTP_HOST ?? "").trim();
const FTP_USER = (process.env.HOSTINGER_FTP_USER ?? "").trim();
const FTP_PASSWORD = process.env.HOSTINGER_FTP_PASSWORD ?? "";
const FTP_PORT = Number(process.env.HOSTINGER_FTP_PORT ?? 21);
/** "false" → FTP simple, "implicit" → FTPS implicite (port 990), sinon FTPS explicite. */
const FTP_SECURE = (process.env.HOSTINGER_FTP_SECURE ?? "true").trim().toLowerCase();

export type StorageDriver = "hostinger" | "local";

export const LOCAL_DIR = path.join(process.cwd(), ".uploads");

export function storageDriver(): StorageDriver {
  return FTP_HOST && FTP_USER && FTP_PASSWORD && PUBLIC_BASE ? "hostinger" : "local";
}

export function storageInfo() {
  const driver = storageDriver();
  return driver === "hostinger"
    ? {
        driver,
        label: "Hostinger — panneau Fichiers (public_html)",
        host: FTP_HOST,
        remoteDir: REMOTE_DIR,
        publicBase: PUBLIC_BASE,
      }
    : {
        driver,
        label: "Stockage local du CRM (.uploads) — FTP Hostinger non configuré",
        host: null,
        remoteDir: LOCAL_DIR,
        publicBase: null,
      };
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/** Nom de fichier sûr et unique : « villa founty (2).JPG » → villa-founty-2-1723…jpg */
export function safeFileName(originalName: string, mimeType: string) {
  const fallback = EXTENSIONS[mimeType] ?? "jpg";
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const ext = EXTENSIONS[mimeType] ?? fallback;
  const stamp = Date.now().toString(36);
  return `${base || "image"}-${stamp}.${ext}`;
}

async function saveToHostinger(name: string, buffer: Buffer) {
  /* import paresseux : le module n'est chargé que si le FTP est configuré */
  const { Client } = await import("basic-ftp");
  const client = new Client(20_000);
  try {
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: FTP_SECURE === "implicit" ? "implicit" : FTP_SECURE !== "false",
    });
    await client.ensureDir(REMOTE_DIR);
    await client.uploadFrom(Readable.from(buffer), name);
  } finally {
    client.close();
  }
  return `${PUBLIC_BASE}/${name}`;
}

async function saveLocally(name: string, buffer: Buffer, origin: string) {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, name), buffer);
  return `${origin.replace(/\/+$/, "")}/uploads/${name}`;
}

export async function saveImage(
  name: string,
  buffer: Buffer,
  origin: string
): Promise<{ url: string; driver: StorageDriver }> {
  const driver = storageDriver();
  const url =
    driver === "hostinger"
      ? await saveToHostinger(name, buffer)
      : await saveLocally(name, buffer, origin);
  return { url, driver };
}
