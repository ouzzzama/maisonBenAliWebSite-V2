"use client";

import * as React from "react";
import { Loader2, ScanText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryLabel, parseListingText, type ParsedListing } from "@/lib/ocr";

/**
 * Remplit la fiche bien depuis une photo d'annonce (affiche, capture WhatsApp,
 * fiche d'agence) : Tesseract lit le texte dans le navigateur — aucune image ni
 * aucun texte n'est envoyé à un service externe.
 */
export function OcrImport({ onExtract }: { onExtract: (data: ParsedListing) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [text, setText] = React.useState<string | null>(null);
  const [found, setFound] = React.useState<string[]>([]);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick(selected: File | null) {
    setError(null);
    setText(null);
    setFound([]);
    setProgress(0);
    setFile(selected);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return selected ? URL.createObjectURL(selected) : null;
    });
  }

  async function read() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    let worker: { recognize: (input: File) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> } | null =
      null;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("fra", 1, {
        logger: (message: { status?: string; progress?: number }) => {
          if (message.status === "recognizing text" && typeof message.progress === "number") {
            setProgress(Math.round(message.progress * 100));
          }
        },
      });
      const result = await worker.recognize(file);
      const raw = result.data.text ?? "";
      setText(raw);
      const parsed = parseListingText(raw);
      const summary = describe(parsed);
      setFound(summary);
      if (summary.length) onExtract(parsed);
      else setError("Aucun champ reconnu — vérifie que le texte est net et assez grand.");
    } catch (cause) {
      setError(
        "Lecture impossible. La première utilisation télécharge le moteur OCR (connexion requise). Détail : " +
          String(cause).slice(0, 120)
      );
    } finally {
      if (worker) await worker.terminate();
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-cream/70 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-coral shadow-sm">
          <ScanText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-ink">Remplir depuis une image</p>
          <p className="text-[11px] leading-snug text-muted">
            Affiche, annonce WhatsApp ou fiche d&apos;agence : le texte est lu sur ton ordinateur, rien
            n&apos;est envoyé en ligne.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
          Choisir une image
        </Button>
      </div>

      {file ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt="Aperçu de l'annonce"
              className="h-16 w-16 rounded-xl border border-ink/10 object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-medium text-ink">{file.name}</p>
            <p className="text-[10.5px] text-ink/45">
              {Math.round(file.size / 1024)} Ko{progress ? ` · lecture ${progress} %` : ""}
            </p>
          </div>
          <Button type="button" variant="coral" onClick={read} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" />}
            {busy ? "Lecture…" : "Lire l'image"}
          </Button>
          <button
            type="button"
            onClick={() => pick(null)}
            aria-label="Retirer l'image"
            className="grid size-8 place-items-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {found.length ? (
        <p className="mt-2 text-[11px] font-medium text-emerald-700">
          Champs remplis : {found.join(" · ")}
        </p>
      ) : null}
      {error ? <p className="mt-2 text-[11px] font-medium text-rose-600">{error}</p> : null}

      {text ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-[10.5px] font-semibold text-ink/45">
            Texte reconnu
          </summary>
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-[10.5px] leading-relaxed text-ink/60">
            {text.trim()}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

function describe(parsed: ParsedListing): string[] {
  const out: string[] = [];
  if (parsed.title) out.push("titre");
  if (parsed.price) out.push("prix");
  if (parsed.surface) out.push("surface");
  if (parsed.rooms) out.push("chambres");
  if (parsed.baths) out.push("salles de bain");
  if (parsed.address) out.push("adresse");
  if (parsed.category) out.push("type " + categoryLabel(parsed.category));
  if (parsed.deal) out.push(parsed.deal === "location" ? "location" : "vente");
  if (parsed.location) out.push("quartier");
  return out;
}
