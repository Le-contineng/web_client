"use client";

import { BellIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { NotificationList } from "@/modules/notifications/presentation/components/NotificationList";
import { UnreadBadge } from "@/modules/notifications/presentation/components/UnreadBadge";
import {
  type NotificationActions,
  useNotifications,
} from "@/modules/notifications/presentation/hooks/useNotifications";

/**
 * Cloche avec compteur de non-lues et liste en popover (en-tête mobile,
 * Administration). La barre latérale ouvre un panneau à la place.
 */
export function NotificationBell({
  initialUnread,
  actions,
}: {
  initialUnread: number;
  actions: NotificationActions;
}) {
  const t = useTranslations("notifications");
  const { unread, list, load } = useNotifications(initialUnread, actions);
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) void load();
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="circle"
            aria-label={unread ? `${t("title")} (${unread})` : t("title")}
          />
        }
      >
        <span className="relative">
          <BellIcon className="size-6" />
          <UnreadBadge count={unread} />
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="ct-sheet ct-menu w-96 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        <p className="px-4 pt-4 pb-3 text-lg font-bold">{t("title")}</p>
        <div className="max-h-[70vh] overflow-y-auto pb-2">
          <NotificationList list={list} onNavigate={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
