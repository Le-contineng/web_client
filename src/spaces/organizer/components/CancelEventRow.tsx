"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CancelEventDialog } from "@/modules/events";
import { cancelEventAction } from "@/modules/events/application/events.actions";
import { ProhibitIcon } from "@/shared/components/icons";

/** Dernière ligne de l'administration d'un événement, en rouge : l'annuler, après confirmation. */
export function CancelEventRow({ eventId }: { eventId: string }) {
  const t = useTranslations("studio.actions");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full items-center gap-4 px-4 text-[15px] font-medium text-destructive outline-none hover:bg-muted/60 focus-visible:bg-muted/60 sm:px-6"
      >
        <ProhibitIcon className="size-5" />
        {t("cancel")}
      </button>
      <CancelEventDialog
        eventId={eventId}
        action={cancelEventAction}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
