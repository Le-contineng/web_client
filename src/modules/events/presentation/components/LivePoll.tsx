"use client";

import { useFormatter, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import { toast } from "sonner";
import {
  refreshPollAction,
  votePollAction,
} from "@/modules/events/application/poll.actions";
import {
  monogram,
  pollState,
  rankOptions,
  type Poll,
} from "@/modules/events/domain/event-story";
import { cn } from "@/shared/lib/utils";

/** Rythme de relecture des votes pendant que le sondage est à l'écran. */
const REFRESH_MS = 1500;
/** Largeur d'une colonne : au-delà de ce qui tient, la zone glisse. */
const COLUMN_PX = 76;

/**
 * Sondage en direct (ADR 0023), dans une zone dédiée au centre du statut : un
 * papier blanc au coin coupé où les options sont des barres verticales sur une
 * même ligne de base, l'image ronde posée au sommet. Les barres suivent les
 * votes et l'ordre se réorganise quand une option en dépasse une autre. On
 * vote en touchant une colonne ; les pourcentages n'apparaissent qu'après,
 * pour ne pas influencer le vote.
 */
export function LivePoll({
  eventId,
  initial,
  signedIn,
}: {
  eventId: string;
  initial: Poll;
  signedIn: boolean;
}) {
  const t = useTranslations("stories.poll");
  const errors = useTranslations("errors");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const [poll, setPoll] = useState(initial);
  const [shown, vote] = useOptimistic(poll, (p, optionId: string) => ({
    ...p,
    viewerVote: optionId,
  }));
  const open = pollState(poll, new Date()) === "open";
  const voted = shown.viewerVote ?? null;
  const ranked = rankOptions(shown);

  // Relecture régulière, seulement quand l'onglet est visible
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      const result = await refreshPollAction(eventId, poll.id);
      if (result.ok)
        setPoll((p) => ({
          ...result.value,
          viewerVote: result.value.viewerVote ?? p.viewerVote,
        }));
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [eventId, poll.id, open]);

  function choose(optionId: string) {
    if (!open || optionId === voted) return;
    if (!signedIn) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    startTransition(async () => {
      vote(optionId);
      const result = await votePollAction(eventId, poll.id, optionId);
      if (result.ok) setPoll(result.value);
      else {
        const code = result.error as "unknown";
        toast.error(errors.has(code) ? errors(code) : errors("unknown"));
      }
    });
  }

  const status = open
    ? `${t("live")} · ${t("votes", { count: shown.totalVotes })}`
    : `${t("closed")} · ${t("votes", { count: shown.totalVotes })}`;

  return (
    <section
      data-interactive
      className="relative mx-auto w-full bg-white py-4 text-ink [clip-path:polygon(0_0,calc(100%-18px)_0,100%_18px,100%_100%,0_100%)]"
    >
      <p className="flex items-center gap-2 px-4 text-[11px] font-bold tracking-widest text-ink/70 uppercase">
        {open && (
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-brand motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-brand" />
          </span>
        )}
        <span aria-live="polite">{status}</span>
      </p>

      <div className="[scrollbar-width:none] overflow-x-auto overscroll-x-contain">
        <ol
          aria-label={shown.question}
          className="relative mx-auto mt-3 h-72"
          style={{ width: ranked.length * COLUMN_PX, minWidth: "100%" }}
        >
          {/* Ligne de base commune : les barres forment un seul ensemble */}
          <span
            aria-hidden
            className="absolute inset-x-3 bottom-12 h-px bg-ink/15"
          />
          {ranked.map((option) => {
            const mine = option.id === voted;
            const leading = option.rank === 1;
            return (
              <li
                key={option.id}
                className="absolute top-0 bottom-0 transition-transform duration-700 ease-[var(--ease-soft)]"
                style={{
                  width: `${100 / ranked.length}%`,
                  minWidth: COLUMN_PX,
                  transform: `translateX(${(option.rank - 1) * 100}%)`,
                }}
              >
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => choose(option.id)}
                  aria-pressed={mine}
                  aria-label={`${t("voteFor", { label: option.label })}${
                    voted ? ` (${option.percent} %)` : ""
                  }`}
                  className="group flex h-full w-full flex-col items-center outline-none disabled:cursor-default"
                >
                  {/* Barre : sa hauteur suit la part de l'option en tête */}
                  <span className="flex w-full flex-1 flex-col items-center justify-end pb-0">
                    {voted && (
                      <span className="mb-1 text-xs font-bold tabular-nums">
                        {format.number(option.percent / 100, {
                          style: "percent",
                        })}
                      </span>
                    )}
                    <span
                      className={cn(
                        "relative z-10 -mb-5 grid size-11 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm transition-shadow group-focus-visible:ring-3 group-focus-visible:ring-brand/50",
                        leading || mine ? "bg-brand" : "bg-ink/70",
                        mine && "ring-3 ring-brand",
                      )}
                    >
                      {option.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={option.imageUrl}
                          alt=""
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        monogram(option.label)
                      )}
                      <span className="absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-ink shadow-sm">
                        {option.rank}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "w-7 rounded-t-full transition-[height,background-color] duration-700 ease-[var(--ease-soft)]",
                        leading || mine ? "bg-brand" : "bg-brand/25",
                      )}
                      style={{
                        height: `calc(${Math.max(option.share, 0.04)} * (100% - 5rem))`,
                      }}
                    />
                  </span>
                  {/* Sous la ligne de base : le nom et les votes */}
                  <span className="grid h-12 w-full content-start px-1 pt-1.5 text-center leading-tight">
                    <span className="line-clamp-2 text-[11px] font-semibold">
                      {option.label}
                    </span>
                    {mine && (
                      <span className="text-[10px] font-semibold text-brand">
                        {t("yourVote")}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {open && (
        <p className="px-4 pt-2 text-center text-xs text-ink/60">
          {voted ? t("changeHint") : t("hint")}
        </p>
      )}
    </section>
  );
}
