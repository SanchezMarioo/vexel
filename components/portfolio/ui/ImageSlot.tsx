import type { ProjectImage } from "@/lib/portfolio/content";

interface ImageSlotProps {
  image: ProjectImage;
  className?: string;
}

/**
 * Labeled placeholder frame for a project screenshot. Keeps the correct
 * aspect ratio so the layout is final before real assets exist. Replace with
 * <Image> from next/image once you drop the file in /public/portfolio — see
 * PORTFOLIO.md.
 */
export default function ImageSlot({ image, className = "" }: ImageSlotProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-pf-subtle ${className}`}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
      role="img"
      aria-label={image.alt}
    >
      {/* Conventional "no image yet" affordance: crossed diagonals on a frame. */}
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
          captura · {image.width}×{image.height}
        </span>
      </div>
    </div>
  );
}
