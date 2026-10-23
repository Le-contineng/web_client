import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import type { Period, EventStatus } from "@/modules/events/domain/event";

/** Badges Modifié / Annulé / En cours : texte explicite, pas seulement une couleur (US-15). */
export function EventBadges({
  status,
  period,
  className,
}: {
  status: EventStatus;
  period: Period;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {period === "ongoing" && status !== "cancelled" && (
        <Badge className="gap-1.5 bg-succes text-white dark:text-[#0a0a0a]">
          <span
            className="size-1.5 animate-pulse rounded-full bg-current"
            aria-hidden
          />
          {t("periods.ongoing")}
        </Badge>
      )}
      {status === "updated" && (
        <Badge
          variant="outline"
          className="border-avertissement bg-avertissement-fond text-avertissement"
        >
          {t("statuses.updated")}
        </Badge>
      )}
      {status === "cancelled" && (
        <Badge
          variant="outline"
          className="border-danger bg-danger-fond text-danger"
        >
          {t("statuses.cancelled")}
        </Badge>
      )}
      {period === "past" && status !== "cancelled" && (
        <Badge variant="secondary">{t("periods.past")}</Badge>
      )}
    </span>
  );
}
