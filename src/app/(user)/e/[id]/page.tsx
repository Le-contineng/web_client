import { CalendarXIcon, PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ViewCount, ViewTracker } from "@/modules/audience";
import { countViews } from "@/modules/audience/server";
import {
  CopyLinkButton,
  ShareButton,
  CancelEventDialog,
  isEditable,
  EventDetails,
} from "@/modules/events";
import { getEventById } from "@/modules/events/server";
import { ButtonGroup } from "@/shared/components/ButtonGroup";
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

  return (
    <div className="pb-6 md:px-6 md:pt-8">
      <UrlToast
        messages={{
          published: t("events.published"),
          updated: t("events.changesSaved"),
          cancelled: t("events.cancelled"),
        }}
      />
      <ViewTracker report={trackEventViewAction.bind(null, event.id)} />
      <EventDetails
        event={event}
        onShare={trackShareClickAction.bind(null, event.id)}
        views={
          isOrganizer ? (
            <ViewCount
              n={
                (await countViews(event.organizerPageId, [event.id])).get(
                  event.id,
                ) ?? 0
              }
            />
          ) : null
        }
        actions={
          <>
            <ButtonGroup className="w-full sm:w-fit">
              <ShareButton
                url={`${clientEnv.NEXT_PUBLIC_SITE_URL}/e/${event.id}`}
                title={event.name}
                text={event.name}
                onShare={trackShareClickAction.bind(null, event.id)}
                className="flex-1 sm:flex-none"
              />
              <CopyLinkButton
                path={`/e/${event.id}`}
                className="flex-1 sm:flex-none"
              />
            </ButtonGroup>
            {isOrganizer && editable && (
              <>
                <Link
                  href={`/e/${event.id}/edit`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "pill",
                  })}
                >
                  <PencilIcon /> {t("events.edit")}
                </Link>
                <CancelEventDialog
                  eventId={event.id}
                  action={cancelEventAction}
                />
              </>
            )}
          </>
        }
      />
    </div>
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
