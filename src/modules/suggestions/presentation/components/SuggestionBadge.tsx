"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { SuggestionForm } from "@/modules/suggestions/presentation/components/SuggestionForm";
import { ChatBubbleIcon, LightbulbIcon } from "@/shared/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

/** L'étiquette « Une idée pour nous ? » ne s'affiche qu'à la première visite, dans ce navigateur. */
const HINT_KEY = "lc:suggestion-hint-seen";
/** Durée d'affichage de l'étiquette. */
const HINT_MS = 5000;
const listeners = new Set<() => void>();

function hintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
}

function markHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    // Navigation privée : l'étiquette reviendra, rien ne casse.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Pastille ronde « Faire une suggestion », posée en bas à droite de la photo
 * d'une page publique. La route ne l'affiche qu'aux non-membres et quand la
 * boîte est ouverte. Sans session, elle mène à la connexion, qui ramène ici
 * avec le formulaire ouvert (`?suggest=1`).
 */
export function SuggestionBadge({
  pageId,
  pageName,
  signedIn,
  autoOpen = false,
}: {
  pageId: string;
  pageName: string;
  signedIn: boolean;
  /** Retour de la connexion : le formulaire s'ouvre tout de suite. */
  autoOpen?: boolean;
}) {
  const t = useTranslations("suggestions");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(signedIn && autoOpen);
  const seen = useSyncExternalStore(subscribe, hintSeen, () => true);

  // Première visite : l'étiquette s'efface d'elle-même au bout de quelques secondes
  useEffect(() => {
    if (seen) return;
    const timer = setTimeout(markHintSeen, HINT_MS);
    return () => clearTimeout(timer);
  }, [seen]);

  function start() {
    markHintSeen();
    if (!signedIn) {
      router.push(
        `/login?returnTo=${encodeURIComponent(`${pathname}?suggest=1`)}`,
      );
      return;
    }
    setOpen(true);
  }

  function change(next: boolean) {
    setOpen(next);
    // Le paramètre de retour de connexion ne doit pas rouvrir le formulaire au rechargement
    if (!next && autoOpen) router.replace(pathname, { scroll: false });
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={start}
              aria-label={t("action")}
              aria-haspopup="dialog"
              // Pastille de 36 px, zone de clic de 44 px (after:)
              className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-3 ring-background transition-transform outline-none after:absolute after:-inset-1 after:rounded-full after:content-[''] hover:scale-105 focus-visible:ring-ring/50 motion-reduce:transition-none sm:right-1 sm:bottom-1"
            />
          }
        >
          <span className="relative grid place-items-center">
            <ChatBubbleIcon className="size-5" />
            <LightbulbIcon
              weight="bold"
              className="absolute top-[3px] size-2.5"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{t("action")}</TooltipContent>
      </Tooltip>
      {!seen && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 animate-in rounded-full bg-foreground px-3 py-1 text-xs font-semibold whitespace-nowrap text-background shadow-md fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
        >
          {t("hint")}
        </span>
      )}
      <Dialog open={open} onOpenChange={change}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogTitle", { page: pageName })}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>
          <SuggestionForm
            pageId={pageId}
            onSent={() => {
              change(false);
              toast.success(t("sent"));
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
