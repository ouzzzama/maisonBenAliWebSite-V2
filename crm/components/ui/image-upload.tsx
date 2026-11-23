"use client";

import * as React from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

/**
 * Bouton « Téléverser » à poser à côté de n'importe quel champ image.
 * L'image compressée part sur l'hébergement Hostinger et le champ reçoit
 * directement l'URL publique du fichier.
 */
export function ImageUploadButton({
  onUploaded,
  label = "Téléverser une image",
  className,
}: {
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPending(true);
    setError(null);
    try {
      const result = await uploadImage(file);
      onUploaded(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        className={cn(
          "focus-ring inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-ink/12 bg-white px-3 text-[11.5px] font-semibold text-ink/65 transition hover:border-ink/25 hover:text-ink",
          pending && "cursor-wait opacity-60"
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ImagePlus className="size-3.5" />
        )}
        {pending ? "Envoi vers Hostinger…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
          className="hidden"
          disabled={pending}
          onChange={onChange}
        />
      </label>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
