import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { EventView } from "@/modules/events/domain/event-view.types";
import {
  eventImage,
  eventImageLayout,
  withInheritedPhoto,
} from "@/modules/events/domain/event-image";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";

/** Vignettes de la première rangée : 3 sur téléphone, 4 ou 5 sur ordinateur. */
const FIRST_ROW = 4;

/**
 * Grille de vignettes au format portrait 3:4 (comme la grille d'Instagram),
 * comme sur les réseaux sociaux : la photo n'est ni coupée ni déformée, elle
 * est centrée sur un fond noir qui comble l'espace restant.
 *
 * Avec `priority` (grille en haut de page), la première rangée se charge tout
 * de suite et la première vignette en priorité (LCP). Les liens ne sont pas
 * préchargés : une grille de 60 vignettes en ferait autant de requêtes.
 */
export function EventGrid({
  events,
  className,
  priority = false,
}: {
  events: EventView[];
  className?: string;
  priority?: boolean;
}) {
  const t = useTranslations();
  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-0.5 sm:gap-1 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {events.map(withInheritedPhoto).map((e, i) => (
        <li key={e.id}>
          <Link
            href={`/e/${e.id}`}
            prefetch={false}
            className="group relative block aspect-[3/4] overflow-hidden bg-black"
          >
            <ProgressiveImage
              src={eventImage(e)}
              fallbackSrc={eventImage({ ...e, photoUrl: null })}
              placeholder={eventImageLayout(e)?.placeholder}
              priority={priority && i === 0}
              eager={priority && i < FIRST_ROW}
              fill
              fit="contain"
              className="bg-black"
              imageClassName={cn(e.status === "cancelled" && "grayscale")}
            />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent p-2 text-left text-xs font-semibold text-white">
              <span className="line-clamp-2">{e.name}</span>
            </span>
            {(e.status !== "published" || e.period !== "upcoming") && (
              <span className="absolute top-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {e.status === "published"
                  ? t(`periods.${e.period}`)
                  : t(`statuses.${e.status}`)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
