"use client";

import { CopyIcon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

type Share = {
  /** Adresse de la fiche ; par défaut, construite depuis l'origine du site. */
  url?: string;
  path?: string;
  title: string;
  text: string;
  onShare?: () => Promise<void>;
};

/**
 * « Partager » (US-36) : menu de partage du téléphone s'il existe, sinon copie
 * du lien. Le lien porte `?via=partage` pour mesurer les arrivées par lien partagé.
 */
function useShare({ url, path, title, text, onShare }: Share) {
  const t = useTranslations("share");
  return async function partager() {
    const base = url ?? `${window.location.origin}${path ?? ""}`;
    const link = `${base}?via=partage`;
    void onShare?.();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(link);
    toast.success(t("linkCopied"));
  };
}

export function ShareButton({
  className,
  ...share
}: Share & { className?: string }) {
  const t = useTranslations("share");
  const shareEvent = useShare(share);
  return (
    <Button
      variant="glass-primary"
      size="pill"
      onClick={shareEvent}
      className={className}
    >
      <SendIcon /> {t("share")}
    </Button>
  );
}

/** « Copier le lien » de la fiche, voisin de « Partager » dans un même groupe de verre. */
export function CopyLinkButton({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const t = useTranslations("events.sheet");
  return (
    <Button
      variant="ghost"
      size="pill"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`);
        toast.success(t("linkCopied"));
      }}
      className={cn("hover:bg-foreground/7", className)}
    >
      <CopyIcon /> {t("copyLink")}
    </Button>
  );
}

/** Variante icône seule, comme l'avion en papier d'Instagram sous une publication. */
export function ShareIconButton({
  className,
  ...share
}: Share & { className?: string }) {
  const t = useTranslations("share");
  const shareEvent = useShare(share);
  return (
    <button
      type="button"
      onClick={shareEvent}
      aria-label={t("share")}
      title={t("share")}
      className={cn(
        "ct-press grid size-11 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6",
        className,
      )}
    >
      <SendIcon />
    </button>
  );
}
