import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
  DateTile,
  eventImage,
  type EventPost,
  EventTime,
  type EventView,
  isEditable,
} from "@/modules/events";
import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  CaretRightIcon,
  EyeIcon,
  PencilSimpleIcon,
  PlusIcon,
  CameraIcon,
} from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import { Fold, foldClip } from "@/spaces/organizer/components/Fold";
import { CancelEventRow } from "@/spaces/organizer/components/CancelEventRow";

/** Vignettes de posts montrées ; au-delà, la dernière porte « +N ». */
const STRIP = 4;

/**
 * Administration d'un événement, sur le modèle de la fiche « Infos » d'une
 * messagerie : l'affiche et l'identité de l'événement au centre, une rangée
 * de grosses actions au pouce, ses chiffres, puis des blocs séparés par le
 * fond gris (posts, programme) et, tout en bas et en rouge, l'annulation.
 * Les actions de modification disparaissent sur un événement passé ou
 * annulé ; l'API revérifie chacune.
 */
export async function EventAdmin({
  slug,
  event,
  posts,
  subEvents,
  views,
}: {
  slug: string;
  event: EventView;
  /** Les plus récents d'abord. */
  posts: EventPost[];
  subEvents: EventView[];
  views: number;
}) {
  const t = await getTranslations();
  const editable = isEditable(event, new Date());
  const cancelled = event.status === "cancelled";
  const base = `/studio/${encodeURIComponent(slug)}`;
  const id = encodeURIComponent(event.id);
  const postCount = event.posts?.count ?? posts.length;
  const interested = event.interestCount ?? 0;

  const ongoing = event.period === "ongoing" && !cancelled;
  const secondary: {
    href: string;
    icon: ReactNode;
    label: string;
    desktopOnly?: boolean;
  }[] = [
    ...(editable
      ? [
          {
            href: `${base}/evenements/${id}/post`,
            icon: <CameraIcon />,
            label: t("studio.admin.short.post"),
            desktopOnly: true,
          },
          {
            href: `${base}/evenements/${id}/modifier`,
            icon: <PencilSimpleIcon />,
            label: t("studio.actions.edit"),
          },
          ...(!event.parent
            ? [
                {
                  href: `${base}/evenements/nouveau?parent=${id}`,
                  icon: <CalendarPlusIcon />,
                  label: t("studio.admin.short.subEvent"),
                },
              ]
            : []),
        ]
      : []),
    {
      href: `/e/${id}`,
      icon: <EyeIcon />,
      label: t("studio.admin.short.view"),
    },
  ];

  return (
    <div className="grid gap-2 bg-secondary dark:bg-background">
      <div className="bg-card pb-5">
        {/* L'affiche en bandeau, comme dans le fil ; le coin se plie pendant l'événement */}
        <div className="relative" style={ongoing ? foldClip(28) : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- bandeau */}
          <img
            src={eventImage(event)}
            alt=""
            className={cn(
              "aspect-[2/1] max-h-64 w-full object-cover",
              cancelled && "grayscale",
            )}
          />
          <span className="absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-transparent" />
          {ongoing && <Fold size={28} />}
          <Link
            href={base}
            aria-label={t("studio.sections.events")}
            className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm outline-none hover:bg-black/55 focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          {ongoing && (
            <span className="absolute top-4 right-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold tracking-wider text-black uppercase">
              {t("studio.badges.ongoing")}
            </span>
          )}
        </div>

        {/* La tuile de date posée sur le bord de l'affiche, la signature du site */}
        <div className="relative -mt-9 flex items-end gap-3 px-4 sm:px-6">
          <DateTile
            iso={event.startsAt}
            className={cn("shrink-0 shadow-md", cancelled && "grayscale")}
          />
          <p className="flex min-w-0 flex-wrap gap-x-1 pb-0.5 text-sm text-muted-foreground">
            <EventTime iso={event.startsAt} className="shrink-0" />
            <span aria-hidden>·</span>
            <span className="truncate">{event.location}</span>
          </p>
        </div>

        <div className="grid gap-1 px-4 pt-3 sm:px-6">
          {event.parent && (
            <Link
              href={`${base}/evenements/${encodeURIComponent(event.parent.id)}`}
              className="w-fit text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:underline"
            >
              {t("studio.admin.subEventOf", { name: event.parent.name })}
            </Link>
          )}
          <h1
            className={cn(
              "text-2xl leading-tight font-bold tracking-tight",
              cancelled && "text-muted-foreground line-through",
            )}
          >
            {event.name}
          </h1>
          {cancelled ? (
            <p className="w-fit rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
              {t("statuses.cancelled")}
            </p>
          ) : (
            !editable && (
              <p className="text-sm text-muted-foreground">
                {t("studio.admin.closed")}
              </p>
            )
          )}
        </div>

        {/* Les actions, en gris ; « Nouveau post » flotte au pouce sur téléphone */}
        <div className="px-4 pt-5 sm:px-6">
          <nav className="flex gap-2 [&>*]:flex-1">
            {secondary.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-muted px-2 text-sm font-medium outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4.5 [&_svg]:shrink-0",
                  action.desktopOnly && "max-sm:hidden",
                )}
              >
                {action.icon}
                <span className="truncate">{action.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Les chiffres, gros, pour décider d'un coup d'œil */}
      <dl className="grid grid-cols-3 bg-card px-2 py-5">
        <Stat
          value={interested}
          label={t("studio.stats.interested", { count: interested })}
        />
        <Stat value={views} label={t("studio.stats.views", { count: views })} />
        <Stat
          value={postCount}
          label={t("studio.stats.posts", { count: postCount })}
        />
      </dl>

      {/* Posts, en vignettes comme « Médias » */}
      <Block
        title={t("posts.title")}
        count={postCount}
        more={
          postCount > 0
            ? { href: `/e/${id}/posts`, label: t("studio.admin.seeAll") }
            : undefined
        }
      >
        {posts.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground sm:px-6">
            {t("studio.admin.noPosts")}
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-1 px-4 pb-4 sm:px-6">
            {posts.slice(0, STRIP).map((post, i) => {
              const rest = postCount - STRIP;
              return (
                <li key={post.id}>
                  <Link
                    href={`/e/${id}/posts#${post.id}`}
                    className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- vignette */}
                    <img
                      src={post.images[0]?.url}
                      alt={post.images[0]?.alt ?? ""}
                      className="size-full object-cover"
                    />
                    {rest > 0 && i === STRIP - 1 && (
                      <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">
                        +{rest}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Block>

      {/* Programme d'un événement principal */}
      {!event.parent && (subEvents.length > 0 || editable) && (
        <Block title={t("subEvents.programme")} count={subEvents.length}>
          <ul>
            {subEvents.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`${base}/evenements/${encodeURIComponent(sub.id)}`}
                  className="flex items-center gap-3 px-4 py-2 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 sm:px-6"
                >
                  <DateTile
                    iso={sub.startsAt}
                    size="sm"
                    tone="ink"
                    className="shrink-0"
                  />
                  <span className="grid min-w-0 flex-1">
                    <span
                      className={cn(
                        "truncate text-[15px] font-semibold",
                        sub.status === "cancelled" &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {sub.name}
                    </span>
                    <span className="flex gap-1 truncate text-sm text-muted-foreground">
                      <EventTime iso={sub.startsAt} className="shrink-0" />
                      <span aria-hidden>·</span>
                      <span className="truncate">{sub.location}</span>
                    </span>
                  </span>
                  <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
            {editable && (
              <li>
                <Link
                  href={`${base}/evenements/nouveau?parent=${id}`}
                  className="flex min-h-14 items-center gap-3 px-4 text-[15px] font-medium outline-none hover:bg-muted/60 focus-visible:bg-muted/60 sm:px-6"
                >
                  <span className="grid size-11 place-items-center rounded-[4px] border border-dashed border-foreground/30">
                    <PlusIcon weight="bold" className="size-5" />
                  </span>
                  {t("studio.admin.addSubEvent")}
                </Link>
              </li>
            )}
          </ul>
        </Block>
      )}

      {editable && (
        <Link
          href={`${base}/evenements/${id}/post`}
          aria-label={t("studio.actions.newPost")}
          className="fixed right-4 bottom-[calc(var(--bottom-nav,0px)+1rem)] z-20 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg outline-none hover:bg-brand-deep focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
        >
          <CameraIcon className="size-6" />
        </Link>
      )}

      {editable && (
        <div className="bg-card pb-20 sm:pb-0">
          <CancelEventRow eventId={event.id} />
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid justify-items-center">
      <dd className="text-3xl leading-none font-bold tracking-tight tabular-nums">
        {value}
      </dd>
      <dt className="order-first mb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
    </div>
  );
}

function Block({
  title,
  count,
  more,
  children,
}: {
  title: string;
  count: number;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="bg-card">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-6">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {title}
          <span className="ml-1.5 text-foreground tabular-nums">{count}</span>
        </h2>
        {more && (
          <Link
            href={more.href}
            className="flex items-center gap-0.5 text-sm font-medium hover:underline"
          >
            {more.label}
            <CaretRightIcon className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
