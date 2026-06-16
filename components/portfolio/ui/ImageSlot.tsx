"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectImage } from "@/lib/portfolio/content";

interface ImageSlotProps {
  image: ProjectImage;
  className?: string;
  /** Marca la imagen como LCP: carga con prioridad y sin lazy (úsalo solo en el Hero). */
  priority?: boolean;
}

export default function ImageSlot({ image, className = "", priority = false }: ImageSlotProps) {
  const [hasError, setHasError] = useState(false);
  const showPlaceholder = hasError || !image.src;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-pf-subtle ${className}`}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
      role="img"
      aria-label={image.alt}
    >
      {!showPlaceholder ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setHasError(true)}
        />
      ) : null}

      {showPlaceholder ? (
        <>
          {/* Fallback visual cuando no existe el archivo o falla la descarga. */}
          <svg
            aria-hidden="true"
            preserveAspectRatio="none"
            viewBox="0 0 100 60"
            className="absolute inset-0 h-full w-full text-pf-line"
          >
            <line x1="0" y1="0" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="0" y2="60" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <div className="relative flex flex-col items-center gap-2 bg-pf-subtle px-5 py-3 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden="true"
              className="h-7 w-7 text-pf-muted"
            >
              <rect x="3" y="3" width="18" height="18" rx="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="pf-mono text-xs text-pf-muted">
              captura · {image.width}x{image.height}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
