"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { setFollowAction } from "@/modules/pages/application/follow.actions";

/**
 * Dernier état connu de chaque page suivie ou quittée dans cet onglet : les
 * autres boutons de la même page (cartes du fil, fiche) le reprennent sans
 * recharger.
 */
const known = new Map<string, boolean>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function remember(slug: string, following: boolean) {
  known.set(slug, following);
  listeners.forEach((listener) => listener());
}

/**
 * « Suivre » une page (ADR 0019). La réponse est immédiate (mise à jour
 * optimiste) ; un refus rétablit l'état précédent. Sans compte (`following`
 * à null), on passe par la connexion.
 *
 * - `button` (page publique) : bouton « Suivre » / « Abonné » ; la page est
 *   relue après coup pour mettre à jour le nombre d'abonnés ;
 * - `inline` (à côté de l'organisateur, sur la fiche) : simple lien
 *   « Suivre », absent si la personne suit déjà la page ;
 * - `card` (à droite de l'en-tête d'une carte du fil) : petit bouton gris,
 *   façon Instagram, absent si la personne suit déjà la page.
 */
export function FollowButton({
  slug,
  following,
  variant = "button",
  className,
}: {
  slug: string;
  /** Si la personne connectée suit la page ; null sans session. */
  following: boolean | null;
  variant?: "button" | "inline" | "card";
  className?: string;
}) {
  const t = useTranslations("pages.follow");
  const errors = useTranslations("errors");
  const router = useRouter();
  const pathname = usePathname();
  const state = useSyncExternalStore(
    subscribe,
    () => known.get(slug) ?? following ?? false,
    () => following ?? false,
  );
  const [shown, show] = useOptimistic(state);

  function toggle() {
    if (following === null) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    const next = !shown;
    startTransition(async () => {
      show(next);
      const result = await setFollowAction(slug, next);
      if (result.ok) {
        remember(slug, result.value.following);
        if (variant === "button") router.refresh();
      } else {
        const code = result.error as "unknown";
        toast.error(errors.has(code) ? errors(code) : errors("unknown"));
      }
    });
  }

  // Déjà abonné au chargement (et toujours) : rien à proposer
  if (variant !== "button" && following && state) return null;

  if (variant === "card") {
    return (
      <button
        type="button"
        aria-pressed={shown}
        onClick={toggle}
        className={cn(
          "shrink-0 rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        {shown ? t("following") : t("follow")}
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        aria-pressed={shown}
        onClick={toggle}
        className={cn(
          "shrink-0 rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
          shown ? "text-muted-foreground" : "text-brand",
          className,
        )}
      >
        {shown ? t("following") : t("follow")}
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={shown ? "secondary" : "default"}
      aria-pressed={shown}
      onClick={toggle}
      className={className}
    >
      {shown ? t("following") : t("follow")}
    </Button>
  );
}
