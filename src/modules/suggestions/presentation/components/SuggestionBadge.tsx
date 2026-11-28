"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import { SuggestionForm } from "@/modules/suggestions/presentation/components/SuggestionForm";
import { BottomSheet, BottomSheetTitle } from "@/shared/components/BottomSheet";
import { ChatBubbleIcon, LightbulbIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useMounted } from "@/shared/hooks/useMounted";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  pagePhotoUrl = null,
  signedIn,
  autoOpen = false,
}: {
  pageId: string;
  pageName: string;
  pagePhotoUrl?: string | null;
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

  const change = useCallback(
    (next: boolean) => {
      setOpen(next);
      // Le paramètre de retour de connexion ne doit pas rouvrir le formulaire au rechargement
      if (!next && autoOpen) router.replace(pathname, { scroll: false });
    },
    [autoOpen, pathname, router],
  );
  const sent = useCallback(() => {
    change(false);
    toast.success(t("sent"));
  }, [change, t]);

  // Ordinateur et tablette : dialogue centré ; téléphone : panneau qui monte du
  // bas. Rien avant d'être dans le navigateur, qui seul connaît la largeur.
  const mounted = useMounted();
  const wide = useMediaQuery("(min-width: 640px)");
  const header = (title: ReactNode, description: ReactNode) => (
    <div className="flex items-center gap-3">
      <ProfileAvatar name={pageName} photo={pagePhotoUrl} size="md" />
      <div className="grid min-w-0 gap-0.5">
        {title}
        {description}
      </div>
    </div>
  );
  const form = (
    <SuggestionForm
      pageId={pageId}
      onSent={sent}
      onCancel={() => change(false)}
    />
  );

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
              // Pastille de 28 px, zone de clic invisible de 40 px (after:)
              className="absolute right-0 bottom-0 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition-transform outline-none after:absolute after:-inset-1.5 after:rounded-full after:content-[''] hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none sm:right-1.5 sm:bottom-1.5"
            />
          }
        >
          <span className="relative grid place-items-center">
            <ChatBubbleIcon className="size-4" />
            <LightbulbIcon
              weight="bold"
              className="absolute top-[2.5px] size-2"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{t("action")}</TooltipContent>
      </Tooltip>
      {!seen && !open && (
        <span
          aria-hidden
          // Téléphone : à droite de la pastille, sous les compteurs, pour ne
          // pas couvrir le nom de la page ; ordinateur : sous la photo
          className="pointer-events-none absolute animate-in rounded-full bg-foreground px-3 py-1 text-xs font-semibold whitespace-nowrap text-background shadow-md fade-in-0 motion-reduce:animate-none max-sm:bottom-0.5 max-sm:left-full max-sm:ml-3 max-sm:slide-in-from-left-1 sm:top-full sm:left-1/2 sm:mt-2 sm:-translate-x-1/2 sm:slide-in-from-top-1"
        >
          {t("hint")}
        </span>
      )}
      {mounted &&
        (wide ? (
          <Dialog open={open} onOpenChange={change}>
            <DialogContent className="gap-6 p-6 sm:max-w-[35rem]">
              {header(
                <DialogTitle className="truncate text-lg">
                  {t("dialogTitle", { page: pageName })}
                </DialogTitle>,
                <DialogDescription>{t("dialogDescription")}</DialogDescription>,
              )}
              {form}
            </DialogContent>
          </Dialog>
        ) : (
          <BottomSheet open={open} onOpenChange={change} fit>
            <div className="grid gap-5 px-5 pt-2">
              {header(
                <BottomSheetTitle className="truncate text-lg font-semibold">
                  {t("dialogTitle", { page: pageName })}
                </BottomSheetTitle>,
                <p className="text-sm text-muted-foreground">
                  {t("dialogDescription")}
                </p>,
              )}
              {form}
            </div>
          </BottomSheet>
        ))}
    </>
  );
}
