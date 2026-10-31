/**
 * Statistiques d'abonnés d'une page (ADR 0020), réservées à ses membres.
 * Jours UTC, du plus ancien au plus récent, aujourd'hui compris.
 */
export type FollowerStatsDay = {
  date: string;
  gained: number;
  lost: number;
  total: number;
};

export type FollowerStats = {
  total: number;
  gained: number;
  lost: number;
  days: FollowerStatsDay[];
};

/** Périodes proposées, en jours ; l'API accepte de 1 à 365. */
export const FOLLOWER_STATS_PERIODS = [7, 30, 90, 365] as const;
export type FollowerStatsPeriod = (typeof FOLLOWER_STATS_PERIODS)[number];
export const DEFAULT_FOLLOWER_STATS_PERIOD: FollowerStatsPeriod = 30;

/** Période lue dans l'adresse (`?days=`) ; toute autre valeur donne 30 jours. */
export function readFollowerStatsPeriod(
  value: string | string[] | undefined,
): FollowerStatsPeriod {
  const days = Number(value);
  return (
    FOLLOWER_STATS_PERIODS.find((p) => p === days) ??
    DEFAULT_FOLLOWER_STATS_PERIOD
  );
}
