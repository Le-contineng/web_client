"use client";

import {
  FlagIcon,
  type Icon,
  KeyIcon,
  LockIcon,
  TrayIcon,
  XCircleIcon,
} from "@/shared/components/icons";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  availableCategories,
  filterByCategory,
  groupByPeriod,
  type NotificationCategory,
} from "@/modules/notifications/domain/notification-groups";
import type {
  Notification,
  NotificationType,
} from "@/modules/notifications/domain/notification.types";

const ICONS: Record<NotificationType, Icon> = {
  pageCreated: FlagIcon,
  requestRejected: XCircleIcon,
  accessGranted: KeyIcon,
  accessRevoked: LockIcon,
  newRequest: TrayIcon,
};

/**
 * Contenu du panneau de notifications : filtres en pastilles, puis les
 * notifications du mois et les précédentes. `null` = chargement en cours.
 */
export function NotificationList({
  list,
  onNavigate,
}: {
  list: Notification[] | null;
  /** Appelé au clic sur une notification qui mène à une page. */
  onNavigate?: () => void;
}) {
  const t = useTranslations("notifications");
  const [category, setCategory] = useState<NotificationCategory>("all");

  if (list === null) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">…</p>;
  }
  if (list.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  const now = new Date();
  const { thisMonth, earlier } = groupByPeriod(
    filterByCategory(list, category),
    now,
  );

  return (
    <div className="grid gap-2">
      <div
        role="group"
        aria-label={t("filter")}
        className="flex flex-wrap gap-2 px-4 pb-2"
      >
        {availableCategories(list).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              category === c
                ? "bg-ink text-ink-foreground"
                : "bg-muted hover:bg-muted/70",
            )}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>
      <Section
        title={t("thisMonth")}
        items={thisMonth}
        now={now}
        onNavigate={onNavigate}
      />
      <Section
        title={t("earlier")}
        items={earlier}
        now={now}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function Section({
  title,
  items,
  now,
  onNavigate,
}: {
  title: string;
  items: Notification[];
  now: Date;
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="px-4 py-2 text-sm font-semibold">{title}</h3>
      <ul>
        {items.map((n) => (
          <li key={n.id}>
            <Item notification={n} now={now} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Item({
  notification: n,
  now,
  onNavigate,
}: {
  notification: Notification;
  now: Date;
  onNavigate?: () => void;
}) {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const Icon = ICONS[n.type];
  const content = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground">
        <Icon className="size-5" />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span
          className={cn("line-clamp-2 text-sm", !n.read && "font-semibold")}
        >
          {t(n.type, n.params)}
        </span>
        <span className="text-xs text-muted-foreground">
          {format.relativeTime(new Date(n.createdAt), now)}
        </span>
      </span>
      {!n.read && (
        <span
          className="size-2 shrink-0 rounded-full bg-foreground"
          aria-hidden
        />
      )}
    </>
  );
  const className = "flex items-center gap-3 px-4 py-2.5";
  return n.link ? (
    <Link
      href={n.link}
      onClick={onNavigate}
      className={cn(className, "hover:bg-muted")}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
