import { useTranslations } from "next-intl";
import Link from "next/link";
import { eventImage } from "@/modules/events/domain/event-image";
import type { Category } from "@/modules/events/domain/event";
import type { ParentEvent } from "@/modules/events/domain/event-view.types";
import { cn } from "@/shared/lib/utils";

/**
 * D'où vient un sous-événement (ADR 0030 du backend), comme la ligne de lieu
 * sous le nom d'un compte dans un post : la mini-affiche de son événement
 * principal, puis « dans [principal] ». Dans l'en-tête de sa carte et sur sa
 * fiche.
 */
export function SubEventOrigin({
  parent,
  categories,
  className,
}: {
  parent: ParentEvent;
  /** Catégories du sous-événement : la photo par défaut du principal en dépend. */
  categories: Category[];
  className?: string;
}) {
  const t = useTranslations("subEvents");
  return (
    <Link
      href={`/e/${encodeURIComponent(parent.id)}`}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-1.5 text-xs text-muted-foreground hover:underline",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- vignette de 16 px */}
      <img
        src={eventImage({
          id: parent.id,
          photoUrl: parent.photoUrl,
          categories,
        })}
        alt=""
        className="size-4 shrink-0 rounded-[3px] object-cover"
      />
      <span className="shrink-0">{t("in")}</span>
      <span className="truncate font-semibold text-foreground">
        {parent.name}
      </span>
    </Link>
  );
}
