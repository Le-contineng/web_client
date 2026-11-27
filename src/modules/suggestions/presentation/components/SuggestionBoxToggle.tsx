"use client";

import { useTranslations } from "next-intl";
import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";
import { setSuggestionBoxAction } from "@/modules/suggestions/application/suggestions.actions";
import { cn } from "@/shared/lib/utils";

/**
 * Interrupteur « Recevoir des suggestions », réservé au propriétaire.
 * Fermer la boîte n'arrête que les nouveaux dépôts : les suggestions reçues
 * restent lisibles et l'on peut encore y répondre.
 */
export function SuggestionBoxToggle({
  pageId,
  open: initial,
}: {
  pageId: string;
  open: boolean;
}) {
  const t = useTranslations("suggestions.box");
  const errors = useTranslations("errors");
  const [open, setOpen] = useState(initial);
  const [shown, show] = useOptimistic(open);

  function toggle() {
    const next = !shown;
    startTransition(async () => {
      show(next);
      const result = await setSuggestionBoxAction(pageId, next);
      if (result.ok) setOpen(result.open);
      else {
        const code = result.error as "unknown";
        toast.error(errors.has(code) ? errors(code) : errors("unknown"));
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="grid gap-0.5">
        <span id="suggestion-box-label" className="font-semibold">
          {t("label")}
        </span>
        <span className="text-sm text-muted-foreground">
          {shown ? t("on") : t("off")}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={shown}
        aria-labelledby="suggestion-box-label"
        onClick={toggle}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
          shown ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-background shadow transition-transform motion-reduce:transition-none",
            shown ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
