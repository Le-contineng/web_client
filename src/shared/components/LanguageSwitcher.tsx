"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GlassSheet } from "@/shared/components/GlassSheet";
import { changeLocale } from "@/shared/i18n/actions";
import { LOCALES, type Locale } from "@/shared/i18n/locales";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

/** Choix FR/EN dans une feuille de verre, mémorisé dans un cookie (D2). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [enCours, startTransition] = useTransition();
  const name = (l: Locale) => (l === "fr" ? t("french") : t("english"));

  return (
    <>
      <Button
        variant="glass"
        size="circle"
        disabled={enCours}
        className={cn("sm:w-auto sm:px-4", className)}
        aria-label={t("language")}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <LanguagesIcon />
        <span className="hidden sm:inline" lang={locale}>
          {name(locale)}
        </span>
      </Button>
      <GlassSheet open={open} onOpenChange={setOpen} title={t("language")}>
        <ul className="grid gap-1 px-3">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                lang={l}
                aria-pressed={l === locale}
                onClick={() =>
                  startTransition(async () => {
                    setOpen(false);
                    if (l === locale) return;
                    await changeLocale(l);
                    router.refresh();
                  })
                }
                className="flex h-12 w-full items-center justify-between rounded-2xl px-3 text-left font-semibold outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {name(l)}
                {l === locale && (
                  <CheckIcon className="size-5 text-ct-blue-ink" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </GlassSheet>
    </>
  );
}
