import {
  CalendarXIcon,
  PencilSimpleIcon,
  PlusIcon,
  CalendarPlusIcon,
} from "@/shared/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ViewCount, ViewTracker } from "@/modules/audience";
import { countViews } from "@/modules/audience/server";
import {
  CancelEventDialog,
  EventDetails,
  EventStage,
  isEditable,
  SubEventProgramme,
} from "@/modules/events";
import { getEventById, getSubEvents } from "@/modules/events/server";
import { UrlToast } from "@/shared/components/UrlToast";
import { env } from "@/shared/config/env";
import { clientEnv } from "@/shared/config/env.client";
import { formatEventDate } from "@/shared/i18n/dates";
import { buttonVariants } from "@/shared/ui/button";
import {
  trackShareClickAction,
  trackEventViewAction,
} from "@/modules/audience/application/audience.actions";
import { cancelEventAction } from "@/modules/events/application/events.actions";
import { getMyPageById } from "@/modules/pages/server";
import { Suspense } from "react";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

const load = (id: string) => getEventById(id);

/**
 * Aperçu WhatsApp (US-36) : nom, image et « [date] · [lieu] », préfixé de
 * « ANNULÉ · » si besoin. Calculé côté serveur dans le fuseau FUSEAU_APERCU.
 */
export async function generateMetadata({
  params,
}: PageProps<"/e/[id]">): Promise<Metadata> {
  const event = await load((await params).id);
  const t = await getTranslations();
  if (!event) return { title: t("events.notFound") };
  const date = formatEventDate(
    event.startsAt,
    await getLocale(),
    {
      today: (time) => t("dates.today", { time }),
      tomorrow: (time) => t("dates.tomorrow", { time }),
    },
    new Date(),
    env.FUSEAU_APERCU,
  );
  const prefix = event.status === "cancelled" ? t("share.cancelledPrefix") : "";
  const row = `${prefix}${date} · ${event.location}`;
  return {
    title: event.name,
    description: row,
    alternates: { canonical: `/e/${event.id}` },
    openGraph: {
      type: "website",
      title: event.name,
      description: row,
      url: `/e/${event.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: row,
    },
  };
}

/** Fiche d'un événement, accessible sans compte (US-01, US-15, US-36, US-39). */
async function EventPage({ params }: PageProps<"/e/[id]">) {
  const { id } = await params;
  const t = await getTranslations();
  const event = await load(id);

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <CalendarXIcon className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t("events.notFound")}</h1>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          {t("events.backToList")}
        </Link>
      </div>
    );
  }

  // Les membres de la page organisatrice voient les vues et peuvent agir ;
  // chaque action est revérifiée par le serveur.
  const isOrganizer = (await getMyPageById(event.organizerPageId)) !== null;
  const editable = isEditable(event, new Date());
  const subEvents = event.subEvents?.count ? await getSubEvents(event.id) : [];

  const views = isOrganizer ? (
    <ViewCount
      className="bg-black/30 text-white backdrop-blur-sm"
      n={
        (await countViews(event.organizerPageId, [event.id])).get(event.id) ?? 0
      }
    />
  ) : null;
  const manage = isOrganizer && editable && (
    <>
      {!event.parent && (
        <Link
          href={`/studio/${event.organizer.slug}/evenements/nouveau?parent=${event.id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          <CalendarPlusIcon /> {t("subEvents.addSubEvent")}
        </Link>
      )}
      <Link
        href={`/studio/${event.organizer.slug}/evenements/${event.id}/post`}
        className={buttonVariants({ variant: "ghost" })}
      >
        <PlusIcon /> {t("posts.newPost")}
      </Link>
      <Link
        href={`/studio/${event.organizer.slug}/evenements/${event.id}/modifier`}
        className={buttonVariants({ variant: "ghost" })}
      >
        <PencilSimpleIcon /> {t("events.edit")}
      </Link>
      <CancelEventDialog eventId={event.id} action={cancelEventAction} />
    </>
  );
  const share = {
    url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/e/${event.id}`,
    onShare: trackShareClickAction.bind(null, event.id),
  };
  const programme = subEvents.length > 0 && (
    <SubEventProgramme subEvents={subEvents} />
  );

  return (
    <>
      <UrlToast
        messages={{
          published: t("events.published"),
          updated: t("events.changesSaved"),
          cancelled: t("events.cancelled"),
        }}
      />
      <ViewTracker report={trackEventViewAction.bind(null, event.id)} />
      {/* Téléphone : plein écran, actions à droite, infos dans un panneau */}
      <EventStage
        event={event}
        share={share}
        manage={manage}
        views={views}
        programme={programme}
        className="md:hidden"
      />
      {/* Ordinateur : la fiche en deux colonnes */}
      <div className="pb-10 max-md:hidden md:px-6 md:pt-8">
        <EventDetails
          event={event}
          share={share}
          views={views}
          manage={manage}
        />
        {/* Programme d'un événement principal (ADR 0030 du backend) */}
        {subEvents.length > 0 && (
          <SubEventProgramme subEvents={subEvents} className="pt-6" />
        )}
      </div>
    </>
  );
}

/**
 * Les paramètres d'URL et la session sont lus dans PageFiche, derrière ce
 * Suspense : le cadre de la page reste instantané (Cache Components).
 */
export default function Page(props: PageProps<"/e/[id]">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <EventPage {...props} />
    </Suspense>
  );
}
