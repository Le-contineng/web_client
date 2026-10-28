"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { setFollowAction } from "@/modules/pages/application/follow.actions";

/**
 * « Suivre » une page (ADR 0019). La réponse est immédiate (mise à jour
 * optimiste), puis la page est relue pour mettre à jour le nombre d'abonnés ;
 * un refus rétablit l'état précédent. Sans compte (`following` à null), on
 * passe par la connexion.
 */
export function FollowButton({
  slug,
  following,
  className,
}: {
  slug: string;
  /** Si la personne connectée suit la page ; null sans session. */
  following: boolean | null;
  className?: string;
}) {
  const t = useTranslations("pages.follow");
  const errors = useTranslations("errors");
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(following ?? false);
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
        setState(result.value.following);
        router.refresh();
      } else {
        const code = result.error as "unknown";
        toast.error(errors.has(code) ? errors(code) : errors("unknown"));
      }
    });
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
