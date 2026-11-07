"use client";

import { MagnifyingGlassIcon } from "@/shared/components/icons";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { useMounted } from "@/shared/hooks/useMounted";
import { useErrorMessages } from "@/shared/i18n/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FILLED_FIELD } from "@/shared/components/form-kit";
import { cn } from "@/shared/lib/utils";

export type MemberRow = {
  accountId: string;
  name: string;
  photoUrl: string | null;
  role: "owner" | "contributor";
  addedAt: string;
};

export type SearchResult = {
  id: string;
  name: string;
  photoUrl: string | null;
  member: boolean;
}[];

/** Rubrique « Accès » du propriétaire (US-06). */
export function AccessManager({
  members,
  search,
  grant,
  remove,
}: {
  members: MemberRow[];
  search: (query: string) => Promise<SearchResult>;
  grant: (accountId: string) => Promise<{ error?: string; name?: string }>;
  remove: (accountId: string) => Promise<{ error?: string }>;
}) {
  const t = useTranslations();
  const errors = useErrorMessages();
  const format = useFormatter();
  const mounted = useMounted();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [enCours, startTransition] = useTransition();

  const q = query.trim();
  const activeSearch = q.includes("@") || q.length >= 3;

  useEffect(() => {
    if (!activeSearch) return;
    const timer = setTimeout(async () => setResults(await search(q)), 250);
    return () => clearTimeout(timer);
  }, [q, activeSearch, search]);

  const grantAccess = (id: string) =>
    startTransition(async () => {
      const r = await grant(id);
      if (r.error) {
        toast.error(errors(r.error));
        return;
      }
      toast.success(t("pages.access.granted", { name: r.name ?? "" }));
      setResults(
        (l) =>
          l?.map((p) => (p.id === id ? { ...p, member: true } : p)) ?? null,
      );
      router.refresh();
    });

  const revokeAccess = (id: string) =>
    startTransition(async () => {
      const r = await remove(id);
      if (r.error) {
        toast.error(errors(r.error));
        return;
      }
      toast.success(t("pages.access.revoked"));
      router.refresh();
    });

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <label htmlFor="search" className="text-sm font-medium">
          {t("pages.access.search")}
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(FILLED_FIELD, "pl-10")}
            autoComplete="off"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("pages.access.searchHelp")}
        </p>
        {activeSearch && results && (
          <ul className="grid divide-y rounded-xl border">
            {results.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">
                {t("pages.access.noResults")}
              </li>
            )}
            {results.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3">
                <ProfileAvatar name={p.name} photo={p.photoUrl} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </span>
                {p.member ? (
                  <Badge variant="secondary">
                    {t("pages.access.alreadyMember")}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={enCours}
                    onClick={() => grantAccess(p.id)}
                  >
                    {t("pages.access.grant")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="grid divide-y rounded-xl border">
        {members.map((m) => (
          <li key={m.accountId} className="flex items-center gap-3 p-3">
            <ProfileAvatar name={m.name} photo={m.photoUrl} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.role === "owner"
                  ? t("pages.roles.owner")
                  : t("pages.access.addedOn", {
                      date: mounted
                        ? format.dateTime(new Date(m.addedAt), {
                            dateStyle: "medium",
                          })
                        : "…",
                    })}
              </p>
            </div>
            {m.role === "contributor" && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="outline" size="sm" disabled={enCours} />
                  }
                >
                  {t("pages.access.revoke")}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("pages.access.revokeConfirmation", { name: m.name })}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeAccess(m.accountId)}
                    >
                      {t("common.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
