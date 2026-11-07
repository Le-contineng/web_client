import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  countByTab,
  DateTile,
  EventTime,
  eventsOfTab,
  type EventView,
  isEditable,
  MANAGEMENT_TABS,
  type ManagementTab,
} from "@/modules/events";
import { CalendarBlankIcon, PlusIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { EventRowActions } from "@/spaces/organizer/components/EventRowActions";

/**
 * Événements d'une page, pour ses membres : des onglets par état (avec leur
 * nombre), puis une ligne par événement avec ce qu'il faut pour décider
 * (quand, où, intéressés, vues, posts) et un menu d'actions. Dense pour en
 * voir sept ou huit sur un téléphone ; la tuile de date passe en encre pour
 * que le fuchsia reste à « Publier ».
 */
export async function EventManagerList({
  slug,
  events,
  views,
  tab,
}: {
  slug: string;
  events: EventView[];
  views: Record<string, number>;
  tab: ManagementTab;
}) {
  const t = await getTranslations();
  const counts = countByTab(events);
  const shown = eventsOfTab(events, tab);
  const now = new Date();
  const base = `/studio/${encodeURIComponent(slug)}`;

  return (
    <section aria-labelledby="studio-events" className="grid">
      <h1 id="studio-events" className="sr-only">
        {t("studio.sections.events")}
      </h1>
      <nav
        aria-label={t("studio.tabsLabel")}
        className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b bg-background px-2 sm:px-4"
      >
        {MANAGEMENT_TABS.map((id) => (
          <Link
            key={id}
            href={id === "upcoming" ? base : `${base}?tab=${id}`}
            scroll={false}
            aria-current={id === tab ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              id === tab
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`studio.tabs.${id}`)}
            <span className="text-xs font-medium tabular-nums">
              {counts[id]}
            </span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <EmptyTab tab={tab} slug={slug} />
      ) : (
        <ul className="divide-y bg-card">
          {shown.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              views={views[event.id] ?? 0}
              editable={isEditable(event, now)}
              ongoing={tab === "ongoing"}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

async function EventRow({
  event,
  views,
  editable,
  ongoing,
}: {
  event: EventView;
  views: number;
  editable: boolean;
  ongoing: boolean;
}) {
  const t = await getTranslations();
  const cancelled = event.status === "cancelled";
  const posts = event.posts?.count ?? 0;
  return (
    <li className="relative flex items-center gap-3 py-3 pr-2 pl-4 sm:pl-6">
      {/* Le geste origami de l'écran : le coin plié de l'événement en cours */}
      {ongoing && (
        <span
          aria-hidden
          className="absolute top-0 right-0 size-[22px] bg-[linear-gradient(225deg,var(--studio-ground,var(--background))_50%,#db2777_50%,#db2777_56%,#a8195c_56%)] drop-shadow-[-1px_1px_1.5px_rgb(0_0_0/0.2)]"
        />
      )}
      <DateTile
        iso={event.startsAt}
        size="sm"
        tone="ink"
        className={cn("shrink-0", cancelled && "opacity-70")}
      />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Link
          href={`/e/${encodeURIComponent(event.id)}`}
          className={cn(
            "truncate text-[15px] leading-snug font-semibold hover:underline",
            cancelled && "text-muted-foreground line-through",
          )}
        >
          {event.name}
        </Link>
        <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
          {ongoing && (
            <span className="shrink-0 rounded-full bg-ink px-1.5 py-px text-[11px] font-semibold text-ink-foreground">
              {t("studio.badges.ongoing")}
            </span>
          )}
          {event.status === "updated" && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[11px] font-semibold text-foreground">
              {t("statuses.updated")}
            </span>
          )}
          <EventTime iso={event.startsAt} className="shrink-0" />
          <span aria-hidden>·</span>
          <span className="truncate">{event.location}</span>
        </p>
        <p className="text-[13px] text-muted-foreground tabular-nums">
          <Stat
            value={event.interestCount ?? 0}
            label={t("studio.stats.interested", {
              count: event.interestCount ?? 0,
            })}
          />
          <span aria-hidden> · </span>
          <Stat
            value={views}
            label={t("studio.stats.views", { count: views })}
          />
          <span aria-hidden> · </span>
          <Stat
            value={posts}
            label={t("studio.stats.posts", { count: posts })}
          />
        </p>
      </div>
      <EventRowActions
        eventId={event.id}
        name={event.name}
        editable={editable}
      />
    </li>
  );
}

/** Chiffre en encre, son libellé en gris : on lit les nombres d'un coup d'œil. */
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{value}</span> {label}
    </span>
  );
}

async function EmptyTab({ tab, slug }: { tab: ManagementTab; slug: string }) {
  const t = await getTranslations("studio.empty");
  return (
    <div className="grid justify-items-center gap-3 bg-card px-6 py-14 text-center">
      <CalendarBlankIcon
        weight="duotone"
        className="size-10 text-muted-foreground"
      />
      <p className="max-w-xs text-sm text-muted-foreground">{t(tab)}</p>
      {tab === "upcoming" && (
        <Link
          href={`/events/new?page=${encodeURIComponent(slug)}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <PlusIcon /> {t("publish")}
        </Link>
      )}
    </div>
  );
}
