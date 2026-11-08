import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  countByTab,
  eventImage,
  eventsOfTab,
  type EventView,
  MANAGEMENT_TABS,
  type ManagementTab,
} from "@/modules/events";
import {
  CalendarBlankIcon,
  FireIcon,
  ImagesIcon,
  PlusIcon,
} from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import { ChatTime, ShortDate } from "@/spaces/organizer/components/ChatTime";
import { Fold, foldClip } from "@/spaces/organizer/components/Fold";

/**
 * Événements d'une page, façon liste de discussions : des filtres en puces
 * (avec leur nombre), puis une ligne par événement — l'affiche en avatar
 * carré, le nom, la dernière activité en aperçu et son heure à droite. Un
 * toucher ouvre la conversation de l'événement (ses posts, ses actions) ;
 * le bouton rond « + » publie un nouvel événement.
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
  const base = `/studio/${encodeURIComponent(slug)}`;

  return (
    <section aria-labelledby="studio-events" className="grid">
      <h1 id="studio-events" className="sr-only">
        {t("studio.sections.events")}
      </h1>
      <nav
        aria-label={t("studio.tabsLabel")}
        className="flex [scrollbar-width:none] gap-5 overflow-x-auto border-b px-4 sm:px-6"
      >
        {MANAGEMENT_TABS.map((id) => (
          <Link
            key={id}
            href={id === "upcoming" ? base : `${base}?tab=${id}`}
            scroll={false}
            aria-current={id === tab ? "page" : undefined}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-1.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              id === tab
                ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`studio.tabs.${id}`)}
            <span className="text-xs text-muted-foreground tabular-nums">
              {counts[id]}
            </span>
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <EmptyTab tab={tab} />
      ) : (
        <ul className="bg-card pb-24">
          {shown.map((event) => (
            <EventRow
              key={event.id}
              base={base}
              event={event}
              views={views[event.id] ?? 0}
              ongoing={tab === "ongoing"}
            />
          ))}
        </ul>
      )}

      {/* Sur téléphone, « Publier » est un simple « + » flottant, au pouce,
          au-dessus de la barre du bas ; sur ordinateur, le bouton de l'en-tête */}
      <Link
        href={`${base}/evenements/nouveau`}
        aria-label={t("studio.publish")}
        className="fixed right-4 bottom-[calc(var(--bottom-nav,0px)+1rem)] z-20 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg outline-none hover:bg-brand-deep focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
      >
        <PlusIcon weight="bold" className="size-6" />
      </Link>
    </section>
  );
}

async function EventRow({
  base,
  event,
  views,
  ongoing,
}: {
  base: string;
  event: EventView;
  views: number;
  ongoing: boolean;
}) {
  const t = await getTranslations();
  const cancelled = event.status === "cancelled";
  const posts = event.posts?.count ?? 0;
  const interested = event.interestCount ?? 0;
  // Dernière activité : le dernier post, sinon la publication
  const last = event.posts?.latestAt ?? event.createdAt;
  return (
    <li>
      <Link
        href={`${base}/evenements/${encodeURIComponent(event.id)}`}
        className="flex items-center gap-3.5 px-4 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 sm:px-6"
      >
        {/* L'affiche en billet, la date sur un bandeau */}
        <span
          className="relative size-14 shrink-0 overflow-hidden bg-muted"
          style={ongoing ? foldClip(12) : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- vignette de 56 px */}
          <img
            src={eventImage(event)}
            alt=""
            className={cn("size-full object-cover", cancelled && "grayscale")}
          />
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] leading-none font-bold tracking-wider text-white uppercase",
              cancelled ? "bg-ink/60" : "bg-ink/85",
            )}
          >
            <ShortDate iso={event.startsAt} />
          </span>
          {ongoing && <Fold size={12} />}
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5 border-b py-4">
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-base leading-snug font-semibold",
                cancelled && "text-muted-foreground line-through",
              )}
            >
              {event.name}
            </p>
            <ChatTime
              iso={last}
              className={cn("shrink-0 text-xs text-muted-foreground")}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="flex min-w-0 flex-1 items-center gap-1 truncate text-sm text-muted-foreground">
              {event.parent ? (
                <span className="truncate">
                  {t("subEvents.subEventOf", { name: event.parent.name })}
                </span>
              ) : cancelled ? (
                <span className="truncate">{t("statuses.cancelled")}</span>
              ) : (
                <>
                  <ImagesIcon aria-hidden className="size-4 shrink-0" />
                  <span className="shrink-0 tabular-nums">
                    {posts} {t("studio.stats.posts", { count: posts })}
                  </span>
                  <span aria-hidden>·</span>
                  <FireIcon aria-hidden className="size-4 shrink-0" />
                  <span className="shrink-0 tabular-nums">{interested}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate tabular-nums">
                    {views} {t("studio.stats.views", { count: views })}
                  </span>
                </>
              )}
            </p>
            {ongoing && (
              <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold tracking-wider text-ink-foreground uppercase">
                {t("studio.badges.ongoing")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

async function EmptyTab({ tab }: { tab: ManagementTab }) {
  const t = await getTranslations("studio.empty");
  return (
    <div className="grid justify-items-center gap-3 bg-card px-6 py-14 text-center">
      <CalendarBlankIcon
        weight="duotone"
        className="size-10 text-muted-foreground"
      />
      <p className="max-w-xs text-sm text-muted-foreground">{t(tab)}</p>
    </div>
  );
}
