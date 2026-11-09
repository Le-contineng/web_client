"use client";

import { CaretLeftIcon, CaretRightIcon } from "@/shared/components/icons";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  addSeen,
  isSeen,
  orderBubbles,
  type StoryBubble,
} from "@/modules/events/domain/stories";
import { StoryViewer } from "@/modules/events/presentation/components/StoryViewer";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { cn } from "@/shared/lib/utils";

/** Stories vues, gardées dans ce navigateur seulement (ADR 0025). */
const SEEN_KEY = "lc:stories-seen";
const listeners = new Set<() => void>();

function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseSeen(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Navigation privée ou stockage plein : tout redevient « non vu », rien ne casse.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Stories des nouveaux événements en tête du fil (ADR 0025) : une bulle par
 * page qui vient de publier, à faire défiler ; les bulles vues passent après
 * les autres. Ouvrir une bulle lance la story de ses nouveaux événements.
 */
export function StoryBar({
  bubbles: initial,
  onViews,
  onShare,
}: {
  bubbles: StoryBubble[];
  /** Écrans vus pendant une story, envoyés en une fois à sa fermeture. */
  onViews?: (eventIds: string[]) => Promise<void>;
  onShare?: (eventId: string) => Promise<void>;
}) {
  const t = useTranslations("stories");
  const seenRaw = useSyncExternalStore(subscribe, readSeen, () => "[]");
  const [opened, setOpened] = useState<number | null>(null);
  const scroller = useRef<HTMLUListElement>(null);

  const seenSet = useMemo(() => new Set(parseSeen(seenRaw)), [seenRaw]);
  // L'ordre est figé à l'ouverture d'une story : voir une bulle ne la déplace pas sous les yeux
  const [frozen, setFrozen] = useState<ReturnType<typeof orderBubbles> | null>(
    null,
  );
  const bubbles = useMemo(
    () => frozen ?? orderBubbles(initial, seenSet),
    [frozen, initial, seenSet],
  );

  // Vues de la story en cours : un seul envoi à la fermeture, ou si la
  // personne quitte l'accueil depuis la story (un lien de la fiche)
  const viewed = useRef<string[]>([]);
  const flushViews = useCallback(() => {
    const ids = viewed.current;
    viewed.current = [];
    if (ids.length) void onViews?.(ids);
  }, [onViews]);
  useEffect(() => flushViews, [flushViews]);

  const markSeen = useCallback((eventId: string) => {
    const previous = parseSeen(readSeen());
    if (!previous.includes(eventId)) writeSeen(addSeen(previous, [eventId]));
  }, []);

  const scrollBy = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  return (
    <section aria-label={t("title")} className="relative">
      <h2 className="sr-only">{t("title")}</h2>
      {bubbles.length > 0 && (
        <>
          <ul
            ref={scroller}
            className="flex [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {bubbles.map((bubble, index) => {
              const viewed = isSeen(bubble, seenSet);
              return (
                <li key={bubble.organizer.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFrozen(bubbles);
                      setOpened(index);
                    }}
                    className="flex w-[4.5rem] flex-col items-center gap-1 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-full p-1",
                        viewed ? "bg-border" : "bg-(image:--story-ring)",
                      )}
                    >
                      <span className="block rounded-full bg-background p-[2px]">
                        <ProfileAvatar
                          name={bubble.organizer.name}
                          photo={bubble.organizer.photoUrl}
                          size="lg"
                          className="size-14"
                        />
                      </span>
                    </span>
                    <span className="grid w-full min-w-0 text-center">
                      <span className="truncate text-xs font-semibold">
                        {bubble.organizer.name}
                      </span>
                    </span>
                    <span className="sr-only">
                      {t("bubble", { count: bubble.events.length })}
                      {viewed ? `, ${t("seen")}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Flèches sur ordinateur seulement ; au doigt, on fait glisser */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={t("scrollLeft")}
            className="absolute top-7 -left-3 hidden size-7 place-items-center rounded-full border bg-background shadow-sm hover:bg-muted md:grid"
          >
            <CaretLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={t("scrollRight")}
            className="absolute top-7 -right-3 hidden size-7 place-items-center rounded-full border bg-background shadow-sm hover:bg-muted md:grid"
          >
            <CaretRightIcon className="size-4" />
          </button>
        </>
      )}
      {opened !== null && (
        <StoryViewer
          bubbles={bubbles}
          start={opened}
          onSeen={(eventId) => {
            markSeen(eventId);
            viewed.current.push(eventId);
          }}
          onShare={onShare}
          onClose={() => {
            flushViews();
            setOpened(null);
            setFrozen(null);
          }}
        />
      )}
    </section>
  );
}
