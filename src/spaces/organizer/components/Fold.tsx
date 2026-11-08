import { cn } from "@/shared/lib/utils";

/**
 * Le coin plié de l'emblème origami : un triangle fuchsia foncé posé sur un
 * coin découpé. À placer dans un parent `relative` dont le coin est
 * découpé par {@link FOLD_CLIP}.
 */
export function Fold({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 right-0 bg-[linear-gradient(225deg,transparent_50%,var(--brand-deep)_50%)]",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

/** Découpe le coin haut droit d'un élément, pour y poser {@link Fold}. */
export const foldClip = (size = 14) => ({
  clipPath: `polygon(0 0, calc(100% - ${size}px) 0, 100% ${size}px, 100% 100%, 0 100%)`,
});
