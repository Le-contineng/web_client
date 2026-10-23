"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type RefObject, useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { ShareIconButton } from "@/modules/events/presentation/components/ShareButton";

const CIRCLE =
  "ct-glass ct-press grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5";

/**
 * Barre de la fiche sur téléphone : transparente sur la photo, elle ne montre
 * que deux cercles de verre (retour, partage) ; une fois la photo dépassée,
 * elle devient une bande de verre. Un IntersectionObserver suit la photo.
 */
export function EventHeroBar({
  hero,
  path,
  title,
  onShare,
}: {
  hero: RefObject<HTMLElement | null>;
  path: string;
  title: string;
  onShare?: () => Promise<void>;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const [overImage, setOverImage] = useState(true);

  useEffect(() => {
    const target = hero.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverImage(entry?.isIntersecting ?? false),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hero]);

  return (
    <div
      className={cn(
        "ct-glass ct-glass--scrim ct-navbar fixed inset-x-0 top-0 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 md:hidden",
        overImage && "is-over-image",
      )}
    >
      <button
        type="button"
        aria-label={t("back")}
        onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
        className={CIRCLE}
      >
        <ChevronLeftIcon className="-translate-x-px" />
      </button>
      <ShareIconButton
        path={path}
        title={title}
        text={title}
        onShare={onShare}
        className={cn(CIRCLE, "hover:bg-transparent")}
      />
    </div>
  );
}
