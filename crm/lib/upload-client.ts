"use client";

/**
 * Préparation et envoi d'une image depuis le navigateur.
 *
 * L'image est d'abord réduite (1800 px de large maximum) puis convertie en WebP
 * avant l'envoi : le fichier déposé sur Hostinger pèse quelques centaines de Ko
 * au lieu de plusieurs Mo, et le site reste rapide à afficher.
 */

const MAX_WIDTH = 1800;
const QUALITY = 0.82;

async function compress(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (typeof document === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  driver: "hostinger" | "local";
};

export async function uploadImage(file: File): Promise<UploadResult> {
  const prepared = await compress(file);
  const body = new FormData();
  body.append("file", prepared);

  const response = await fetch("/api/upload", { method: "POST", body });
  const data = (await response.json().catch(() => null)) as
    | (UploadResult & { error?: string; detail?: string })
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error ?? data?.detail ?? "Envoi de l'image impossible");
  }
  return data;
}
