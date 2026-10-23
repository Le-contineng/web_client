"use client";

import { MoonIcon, SlidersHorizontalIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/shared/hooks/useTheme";
import { useMounted } from "@/shared/hooks/useMounted";
import { cn } from "@/shared/lib/utils";
import type { Theme } from "@/shared/lib/theme";
import { SEGMENT_CLASS, Segmented } from "@/shared/components/Segmented";

const ICONS = {
  system: SlidersHorizontalIcon,
  dark: MoonIcon,
  light: SunIcon,
} satisfies Record<Theme, unknown>;

const THEMES = Object.keys(ICONS) as Theme[];

/** Sélecteur Système / Sombre / Clair, en contrôle segmenté à curseur de verre. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  // La préférence n'est connue que dans le navigateur.
  const mounted = useMounted();

  return (
    <Segmented
      label={t("label")}
      index={mounted ? THEMES.indexOf(theme) : -1}
      count={THEMES.length}
      className={cn("shrink-0", className)}
    >
      {THEMES.map((value) => {
        const Icon = ICONS[value];
        return (
          <button
            key={value}
            type="button"
            aria-pressed={mounted && theme === value}
            aria-label={t(value)}
            title={t(value)}
            onClick={() => setTheme(value)}
            className={cn(SEGMENT_CLASS, "w-11 px-0")}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </Segmented>
  );
}
