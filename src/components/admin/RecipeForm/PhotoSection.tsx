"use client";

import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

interface PhotoSectionProps {
  /** Saved path/URL currently in the form (may be empty). */
  featuredImage: string | undefined;
  /** Local object URL shown immediately after picking a file. */
  previewUrl: string | null;
  uploading: boolean;
  error: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}

export function PhotoSection({
  featuredImage,
  previewUrl,
  uploading,
  error,
  onPick,
  onRemove,
}: PhotoSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const src = previewUrl ?? (featuredImage || null);

  return (
    <section className="flex flex-col gap-3" aria-label="Photo">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />

      {src ? (
        <>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-steam">
            <Image
              src={src}
              alt="Recipe photo"
              fill
              unoptimized={!!previewUrl}
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-white">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm font-medium">Uploading…</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Change photo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 text-paprika hover:text-paprika"
              disabled={uploading}
              onClick={onRemove}
            >
              Remove
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-steam bg-card text-ink/60 transition-colors hover:bg-enamel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
        >
          <Camera className="size-8" />
          <span className="text-base font-medium">Add a photo</span>
        </button>
      )}

      {error && <p className="text-sm text-paprika">{error}</p>}
    </section>
  );
}
