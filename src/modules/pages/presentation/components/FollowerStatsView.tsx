import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import {
  FOLLOWER_STATS_PERIODS,
  type FollowerStats,
  type FollowerStatsDay,
  type FollowerStatsPeriod,
} from "@/modules/pages/domain/follower-stats";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 8;

/**
 * Statistiques d'abonnés d'une page (ADR 0020) : trois chiffres, la courbe du
 * total et le détail des jours qui ont bougé. Rendu serveur, sans JavaScript :
 * la période est un lien qui change `?days=`.
 */
export function FollowerStatsView({
  stats,
  period,
  basePath,
}: {
  stats: FollowerStats;
  period: FollowerStatsPeriod;
  basePath: string;
}) {
  const t = useTranslations("pages.followerStats");
  const format = useFormatter();
  const moved = stats.days.filter((d) => d.gained || d.lost).reverse();
  const first = stats.days[0];
  const last = stats.days.at(-1);
  const day = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00Z`), {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  return (
    <div className="grid gap-5 px-4 pb-4 sm:px-0">
      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      <nav aria-label={t("period")} className="flex flex-wrap gap-2">
        {FOLLOWER_STATS_PERIODS.map((p) => (
          <Link
            key={p}
            href={`${basePath}?days=${p}`}
            aria-current={p === period ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground",
              p === period &&
                "border-foreground bg-foreground text-background hover:text-background",
            )}
          >
            {p === 365 ? t("year") : t("days", { count: p })}
          </Link>
        ))}
      </nav>

      <dl className="grid grid-cols-3 gap-3">
        <Figure label={t("total")} value={format.number(stats.total)} />
        <Figure label={t("gained")} value={`+${format.number(stats.gained)}`} />
        <Figure label={t("lost")} value={`−${format.number(stats.lost)}`} />
      </dl>

      {first && last && (
        <figure className="grid gap-1">
          <TotalChart
            days={stats.days}
            label={t("chartLabel", {
              count: period,
              first: first.total,
              last: last.total,
            })}
          />
          <figcaption className="flex justify-between text-xs text-muted-foreground">
            <span>{day(first.date)}</span>
            <span>{day(last.date)}</span>
          </figcaption>
        </figure>
      )}

      {moved.length ? (
        <details className="rounded-xl border p-4 text-sm">
          <summary className="cursor-pointer font-medium">
            {t("details")}
          </summary>
          <table className="mt-3 w-full text-left tabular-nums">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="py-1 font-medium">
                  {t("date")}
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {t("gained")}
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {t("lost")}
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {t("total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {moved.map((d) => (
                <tr key={d.date} className="border-t">
                  <th scope="row" className="py-1.5 font-normal">
                    {day(d.date)}
                  </th>
                  <td className="py-1.5 text-right">+{d.gained}</td>
                  <td className="py-1.5 text-right">−{d.lost}</td>
                  <td className="py-1.5 text-right">{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ) : (
        <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      )}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Courbe du total en fin de journée ; plate et centrée si rien n'a bougé. */
function TotalChart({
  days,
  label,
}: {
  days: FollowerStatsDay[];
  label: string;
}) {
  const totals = days.map((d) => d.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const x = (i: number) =>
    days.length === 1 ? WIDTH / 2 : (i / (days.length - 1)) * WIDTH;
  const y = (total: number) =>
    max === min
      ? HEIGHT / 2
      : PADDING + ((max - total) / (max - min)) * (HEIGHT - 2 * PADDING);
  const line = totals.map((n, i) => `${x(i)},${y(n)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="h-40 w-full rounded-xl border bg-muted/20"
    >
      <polygon
        points={`0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`}
        className="fill-foreground/10"
      />
      <polyline
        points={line}
        fill="none"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className="stroke-foreground"
      />
    </svg>
  );
}
