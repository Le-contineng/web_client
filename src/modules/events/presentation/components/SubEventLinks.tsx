import { useTranslations } from "next-intl";
import Link from "next/link";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventDate } from "@/modules/events/presentation/components/EventDate";
import { CalendarDotsIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";

/**
 * Lien d'un événement avec sa famille (ADR 0030 du backend) : sur un
 * événement principal, son prochain rendez-vous (option C : il fait remonter
 * la carte dans le fil) ; sur un sous-événement, l'événement dont il fait
 * partie.
 */
export function SubEventLinks({
  event,
  className,
}: {
  event: Pick<EventView, "parent" | "subEvents">;
  className?: string;
}) {
  const t = useTranslations("subEvents");
  const next = event.subEvents?.next;
  if (next) {
    return (
      // Deux lignes : quand (et le libellé), puis le nom entier du rendez-vous
      <Link
        href={`/e/${encodeURIComponent(next.id)}`}
        className={cn(
          "group mt-1 grid gap-0.5 rounded-xl bg-muted px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <CalendarDotsIcon aria-hidden className="size-4 shrink-0" />
          <span className="shrink-0">{t("nextUp")}</span>
          <span aria-hidden>·</span>
          <EventDate iso={next.startsAt} className="truncate" />
        </span>
        <span className="truncate font-semibold group-hover:underline">
          {next.name}
        </span>
      </Link>
    );
  }
  if (event.parent) {
    return (
      <p className={cn("min-w-0 truncate text-sm", className)}>
        <span className="text-muted-foreground">{t("partOf")} </span>
        <Link
          href={`/e/${encodeURIComponent(event.parent.id)}`}
          className="font-medium hover:underline"
        >
          {event.parent.name}
        </Link>
      </p>
    );
  }
  return null;
}
