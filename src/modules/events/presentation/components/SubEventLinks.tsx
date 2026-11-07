import { useTranslations } from "next-intl";
import Link from "next/link";
import type {
  EventView,
  ParentEvent,
} from "@/modules/events/domain/event-view.types";
import { CalendarDotsIcon, CaretRightIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";

/**
 * Famille d'un sous-événement (ADR 0030 du backend), au-dessus de son titre :
 * le nom de son événement principal, cliquable, et sa place dans le
 * programme (« 2 sur 3 »). Sur la carte du fil comme sur la fiche.
 */
export function SubEventFamily({
  parent,
  className,
}: {
  parent: ParentEvent;
  className?: string;
}) {
  const t = useTranslations("subEvents");
  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground",
        className,
      )}
    >
      <Link
        href={`/e/${encodeURIComponent(parent.id)}`}
        aria-label={t("partOfName", { name: parent.name })}
        className="flex min-w-0 items-center gap-0.5 font-semibold text-foreground hover:underline"
      >
        <span className="truncate">{parent.name}</span>
        <CaretRightIcon
          aria-hidden
          className="size-3.5 shrink-0"
          weight="bold"
        />
      </Link>
      {parent.position > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="shrink-0 tabular-nums">
            {t("position", { position: parent.position, total: parent.total })}
          </span>
        </>
      )}
    </p>
  );
}

/**
 * Sur la carte d'un événement principal : son programme (« Programme · 3
 * rendez-vous »), puisque chaque rendez-vous a déjà sa propre carte dans le
 * fil.
 */
export function SubEventLinks({
  event,
  className,
}: {
  event: Pick<EventView, "id" | "subEvents">;
  className?: string;
}) {
  const t = useTranslations("subEvents");
  const count = event.subEvents?.count ?? 0;
  if (count === 0) return null;
  return (
    <Link
      href={`/e/${encodeURIComponent(event.id)}#programme`}
      className={cn(
        "flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline",
        className,
      )}
    >
      <CalendarDotsIcon aria-hidden className="size-4 shrink-0" />
      <span className="font-medium text-foreground">{t("programme")}</span>
      <span aria-hidden>·</span>
      <span>{t("programmeCount", { count })}</span>
    </Link>
  );
}
