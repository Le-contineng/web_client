import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";
import { categoryColor } from "@/modules/events/domain/category-color";
import type { Category } from "@/modules/events/domain/event";

/**
 * Catégories en pastilles de verre teintées de leur couleur, à poser sur une
 * image (flou de 12 px seulement : elles vivent dans des listes).
 */
export function CategoryChips({
  categories,
  className,
}: {
  categories: readonly Category[];
  className?: string;
}) {
  const t = useTranslations("categories");
  if (categories.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {categories.map((c) => (
        <li key={c} className="ct-glass-chip" style={chipStyle(c)}>
          {t(c)}
        </li>
      ))}
    </ul>
  );
}

/** Variable --chip d'une catégorie, pour les pastilles et les capsules. */
export function chipStyle(category: Category): CSSProperties {
  return { "--chip": categoryColor(category) } as CSSProperties;
}

/**
 * Capsule de catégorie sélectionnable (lien de filtre ou case du
 * formulaire) : point de couleur, puis pastille pleine cochée quand elle est
 * choisie (case cochée ou `aria-current="true"`).
 */
export const CAPSULE_CLASS =
  "group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold whitespace-nowrap shadow-[inset_0_0_0_1px_var(--ct-border)] transition-colors select-none hover:bg-muted has-checked:bg-(--chip) has-checked:text-white has-checked:shadow-none has-focus-visible:ring-3 has-focus-visible:ring-ring/50 aria-[current=true]:bg-(--chip) aria-[current=true]:text-white aria-[current=true]:shadow-none";

/** Point de couleur, remplacé par une coche quand la capsule est choisie. */
export function CapsuleMark() {
  return (
    <>
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full bg-(--chip) group-has-checked:hidden group-aria-[current=true]:hidden"
      />
      <CheckIcon
        aria-hidden
        className="hidden size-4 shrink-0 group-has-checked:block group-aria-[current=true]:block"
      />
    </>
  );
}
