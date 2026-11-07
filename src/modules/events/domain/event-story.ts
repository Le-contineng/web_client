/**
 * Contenus d'un événement (sondage, billetterie, annonce…), montrés en tuiles
 * sous l'affiche et ouverts en statuts plein écran (ADR 0023).
 */
export const STORY_KINDS = [
  "poll",
  "ticket",
  "registration",
  "announcement",
  "result",
  "program",
  "map",
  "photos",
] as const;
export type StoryKind = (typeof STORY_KINDS)[number];

export type PollOption = {
  id: string;
  label: string;
  imageUrl: string | null;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  /** Avant cette date, le sondage n'est pas encore ouvert. */
  opensAt: string | null;
  closesAt: string | null;
  totalVotes: number;
  options: PollOption[];
  /** Option choisie par la personne connectée ; absent sans compte ou sans vote. */
  viewerVote?: string | null;
};

export type EventStory = {
  id: string;
  kind: StoryKind;
  title: string;
  detail: string | null;
  /** Destination du bouton d'action (billetterie, itinéraire…). */
  actionUrl: string | null;
  poll?: Poll | null;
};

/**
 * Fond du statut, aux couleurs de la marque : la marque pour ce qui engage
 * (voter, réserver, s'inscrire), l'encre pour ce qui informe, la marque
 * foncée pour ce qui organise.
 */
export type StoryTone = "brand" | "ink" | "deep";

export function storyTone(kind: StoryKind): StoryTone {
  switch (kind) {
    case "poll":
    case "ticket":
    case "registration":
      return "brand";
    case "announcement":
    case "result":
    case "photos":
      return "ink";
    case "program":
    case "map":
      return "deep";
  }
}

/** Tuiles visibles sous l'affiche ; les suivantes sont résumées par « +N ». */
export const VISIBLE_TILES = 2;

/** Premier contenu non vu (celui qui porte le halo), ou null si tout est vu. */
export function firstUnseen(
  stories: Pick<EventStory, "id">[],
  seen: ReadonlySet<string>,
): number | null {
  const i = stories.findIndex((s) => !seen.has(s.id));
  return i === -1 ? null : i;
}

export type PollState = "upcoming" | "open" | "closed";

export function pollState(poll: Poll, now: Date): PollState {
  if (poll.opensAt && now < new Date(poll.opensAt)) return "upcoming";
  if (poll.closesAt && now >= new Date(poll.closesAt)) return "closed";
  return "open";
}

export type RankedOption = PollOption & {
  /** Rang à partir de 1 ; les ex æquo gardent l'ordre de l'API. */
  rank: number;
  /** Part des votes, arrondie à l'entier. */
  percent: number;
  /** Hauteur relative à l'option en tête, entre 0 et 1. */
  share: number;
};

/** Classement du sondage, de l'option en tête à la dernière. */
export function rankOptions(poll: Pick<Poll, "options">): RankedOption[] {
  const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const max = Math.max(0, ...poll.options.map((o) => o.votes));
  return poll.options
    .map((o, index) => ({ o, index }))
    .sort((a, b) => b.o.votes - a.o.votes || a.index - b.index)
    .map(({ o }, i) => ({
      ...o,
      rank: i + 1,
      percent: total ? Math.round((o.votes / total) * 100) : 0,
      share: max ? o.votes / max : 0,
    }));
}

/** Monogramme d'une option sans image : son premier mot (« INP Toulouse » → « INP »). */
export function monogram(label: string): string {
  return (label.trim().split(/\s+/)[0] ?? "").slice(0, 5).toUpperCase();
}
