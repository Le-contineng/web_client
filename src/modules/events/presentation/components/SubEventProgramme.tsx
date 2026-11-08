import { useTranslations } from "next-intl";
import Link from "next/link";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { DateTile } from "@/modules/events/presentation/components/DateTile";
import { EventTime } from "@/modules/events/presentation/components/EventTime";
import { cn } from "@/shared/lib/utils";

/**
 * Programme d'un événement principal (ADR 0030 du backend) : ses
 * sous-événements du plus tôt au plus tard, chacun avec sa tuile de date, son
 * heure et son lieu. Les passés et les annulés restent visibles, grisés.
 */
export function SubEventProgramme({
  subEvents,
  className,
}: {
  subEvents: EventView[];
  className?: string;
}) {
  const t = useTranslations();
  if (subEvents.length === 0) return null;
  return (
    <section
      aria-labelledby="programme"
      className={cn("grid gap-3", className)}
    >
      <h2
        id="programme"
        className="flex items-baseline gap-2 text-lg font-semibold"
      >
        {t("subEvents.programme")}
        <span className="text-sm font-normal text-muted-foreground">
          {t("subEvents.programmeCount", { count: subEvents.length })}
        </span>
      </h2>
      <ol className="grid divide-y rounded-xl border">
        {subEvents.map((sub) => {
          const cancelled = sub.status === "cancelled";
          const done = cancelled || sub.period === "past";
          return (
            <li key={sub.id}>
              <Link
                href={`/e/${encodeURIComponent(sub.id)}`}
                className="flex items-center gap-3 p-3 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <DateTile
                  iso={sub.startsAt}
                  size="sm"
                  className={cn("shrink-0", done && "grayscale")}
                />
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span
                    className={cn(
                      "truncate font-semibold",
                      cancelled && "text-muted-foreground line-through",
                      sub.period === "past" && "text-muted-foreground",
                    )}
                  >
                    {sub.name}
                  </span>
                  <span className="flex min-w-0 gap-1.5 text-sm text-muted-foreground">
                    {cancelled ? (
                      <span>{t("statuses.cancelled")}</span>
                    ) : (
                      <EventTime iso={sub.startsAt} className="shrink-0" />
                    )}
                    <span aria-hidden>·</span>
                    <span className="truncate">{sub.location}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
