"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMounted } from "@/shared/hooks/useMounted";

/**
 * Heure façon messagerie : l'heure aujourd'hui, « Hier », le jour de la
 * semaine dans les sept derniers jours, sinon la date courte. Dans le
 * fuseau de l'appareil : rendue dans le navigateur.
 */
export function ChatTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const mounted = useMounted();
  const format = useFormatter();
  const t = useTranslations("studio.chat");
  const date = new Date(iso);
  let text = " ";
  if (mounted) {
    const days = dayDiff(date, new Date());
    if (days === 0)
      text = format.dateTime(date, { hour: "2-digit", minute: "2-digit" });
    else if (days === 1) text = t("yesterday");
    else if (days > 1 && days < 7)
      text = format.dateTime(date, { weekday: "long" });
    else
      text = format.dateTime(date, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
  }
  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}

/** Nombre de jours calendaires entre deux dates, dans le fuseau de l'appareil. */
function dayDiff(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** « 06 NOV » : le jour et le mois court, pour le bandeau d'une affiche. */
export function ShortDate({ iso }: { iso: string }) {
  const mounted = useMounted();
  const format = useFormatter();
  if (!mounted) return <> </>;
  const date = new Date(iso);
  return (
    <time dateTime={iso}>
      {format.dateTime(date, { day: "2-digit" })}{" "}
      {format.dateTime(date, { month: "short" }).replace(".", "")}
    </time>
  );
}
