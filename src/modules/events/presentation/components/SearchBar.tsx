"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { SEARCH_MAX_LENGTH } from "@/modules/events/domain/search";

/**
 * Champ de recherche façon Instagram (Explorer), en capsule de verre de 50 px
 * (anneau bleu et halo au focus). La saisie est reprise dans
 * l'adresse (`?q=`) après une courte pause, pour qu'une recherche se partage.
 */
export function SearchBar({ value }: { value: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [text, setText] = useState(value);
  const [enCours, startTransition] = useTransition();

  useEffect(() => {
    if (text.trim() === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => {
      const nextEvents = new URLSearchParams(params);
      if (text.trim()) nextEvents.set("q", text.trim());
      else nextEvents.delete("q");
      const query = nextEvents.toString().replaceAll("%2C", ",");
      startTransition(() =>
        router.replace(query ? `${path}?${query}` : path, {
          scroll: false,
        }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [text, params, path, router]);

  return (
    <div
      role="search"
      className="ct-glass ct-search relative flex items-center gap-2.5 px-[18px]"
    >
      <SearchIcon
        aria-hidden
        className="size-5 shrink-0 text-[#434b57] dark:text-[#b9c0ca]"
      />
      <input
        type="search"
        value={text}
        maxLength={SEARCH_MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        aria-busy={enCours}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#434b57] dark:placeholder:text-[#b9c0ca] [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText("")}
          aria-label={t("clear")}
          className="ct-press -mr-2.5 grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="grid size-6 place-items-center rounded-full bg-foreground/15">
            <XIcon className="size-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
