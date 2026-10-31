"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";
import { ExpandableText } from "@/shared/components/ExpandableText";
import { CaretRightIcon, MegaphoneIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { cn } from "@/shared/lib/utils";
import { feedImageRatio, ShareIconButton } from "@/modules/events";
import {
  type Campaign,
  type PosterLayout,
  sponsorHref,
} from "@/modules/campaigns/domain/campaign";
import { CampaignLink } from "@/modules/campaigns/presentation/components/CampaignLink";
import type { TrackCampaign } from "@/modules/campaigns/presentation/components/track";
import { trackImpressionOncePerDay } from "@/modules/campaigns/presentation/components/track-impression";

/** Dimensions inconnues (affiche ancienne) : format d'une affiche d'événement, 4:5. */
const posterRatio = (layout: PosterLayout | null | undefined) =>
  layout ? feedImageRatio(layout) : 4 / 5;

/**
 * Campagne en tête du fil (FEED_TOP), dans la grammaire d'une carte
 * d'événement : qui la diffuse, compte ou page (« Sponsorisé » à la place
 * de la date de publication), l'affiche, puis le texte. Comme sur Instagram, une barre
 * d'action sous le visuel la distingue d'une publication. Une affiche
 * détourée se pose sur un fond teinté de la couleur de la campagne. Elle ne se ferme
 * pas : elle défile avec le fil ; seule la bannière du bas se ferme.
 */
export function CampaignCard({
  campaign,
  track,
}: {
  campaign: Campaign;
  track?: TrackCampaign;
}) {
  const t = useTranslations("campaigns");
  const accent = campaign.accentColor ?? "var(--brand)";
  const sponsored = campaign.kind === "SPONSORED";
  const { sponsor } = campaign;
  const profile = sponsorHref(sponsor);
  const onClick = () => void track?.(campaign.id, "FEED_TOP", "CLICK");

  useEffect(() => {
    trackImpressionOncePerDay(track, campaign.id, "FEED_TOP");
  }, [campaign.id, track]);

  return (
    <article
      data-campaign-card={campaign.id}
      className="grid min-w-0 grid-cols-1 gap-2.5 border-b pb-6 sm:border-none sm:pb-0"
    >
      <header className="flex items-center gap-2.5 px-4 sm:px-0">
        {profile ? (
          // Doublon du lien du nom : caché aux lecteurs d'écran et au clavier
          <Link href={profile} aria-hidden tabIndex={-1} className="shrink-0">
            <ProfileAvatar
              name={sponsor.name}
              photo={sponsor.photoUrl}
              size="sm"
            />
          </Link>
        ) : (
          <ProfileAvatar
            name={sponsor.name}
            photo={sponsor.photoUrl}
            size="sm"
          />
        )}
        <div className="grid min-w-0 flex-1 leading-tight">
          {profile ? (
            <Link
              href={profile}
              className="truncate text-sm font-semibold hover:underline"
            >
              {sponsor.name}
            </Link>
          ) : (
            <span className="truncate text-sm font-semibold">
              {sponsor.name}
            </span>
          )}
          <span className="truncate text-xs text-muted-foreground">
            {sponsored ? t("sponsored") : t("announcementShort")}
          </span>
        </div>
      </header>

      {/* Affiche et barre d'action pleine largeur, façon Instagram : un seul lien */}
      <CampaignLink
        to={campaign.target}
        onClick={onClick}
        aria-label={campaign.title}
        className="block sm:overflow-hidden sm:rounded-lg"
      >
        {campaign.posterUrl && (
          <span
            className="relative block max-h-[70svh] w-full"
            style={{
              aspectRatio: posterRatio(campaign.posterLayout),
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            }}
          >
            {/* Cadre aux proportions de l'affiche, bornées comme une photo d'événement
                et jamais plus haut que 70 % de l'écran : sa place est réservée avant le
                chargement (CLS). L'affiche y est entière, sur le fond teinté. Toujours en
                tête de page : c'est la plus grande image visible (LCP), en priorité. */}
            <ProgressiveImage
              src={campaign.posterUrl}
              placeholder={campaign.posterLayout?.placeholder}
              fill
              fit="contain"
              priority
              className="bg-transparent"
            />
          </span>
        )}
        <span
          className="flex items-center justify-end gap-1 px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: accent }}
        >
          {t("learnMore")}
          <CaretRightIcon className="size-4" />
        </span>
      </CampaignLink>

      {/* Ligne d'actions d'une carte d'événement : la tuile façon billet remonte
          sur le coin gauche de la barre (le texte est à droite), le partage à
          sa place habituelle, aligné sur le bas de la tuile */}
      <div className="flex items-end justify-between gap-3 px-4 sm:px-0">
        <PromoTile accent={accent} className="relative -mt-8 shrink-0" />
        <ShareIconButton
          className="-mr-2 -mb-2"
          path={`/c/${campaign.id}`}
          title={campaign.title}
          text={campaign.title}
        />
      </div>

      <div className="grid gap-1 px-4 sm:px-0">
        <h2 className="text-base leading-snug font-semibold">
          <CampaignLink
            to={campaign.target}
            onClick={onClick}
            className="hover:underline"
          >
            {campaign.title}
          </CampaignLink>
        </h2>
        {/* Deux lignes, puis « voir plus » qui déplie le reste sur place */}
        {campaign.body && (
          <ExpandableText
            text={campaign.body}
            lines={2}
            className="text-sm text-muted-foreground"
          />
        )}
      </div>
    </article>
  );
}

/**
 * Tuile façon billet, au gabarit de la tuile de date d'un événement : bandeau
 * dans la couleur de la campagne et mégaphone. Elle signale une mise en avant
 * sans écrire « PUB » ; la mention « Sponsorisé » reste dans l'en-tête.
 */
function PromoTile({
  accent,
  className,
}: {
  accent: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid w-11 grid-rows-[auto_1fr] overflow-hidden rounded-[4px] border bg-card leading-none",
        className,
      )}
    >
      <span className="h-3.5" style={{ background: accent }} />
      <span className="grid place-items-center py-1.5">
        <MegaphoneIcon
          className="size-6"
          weight="fill"
          style={{ color: accent }}
        />
      </span>
    </span>
  );
}
