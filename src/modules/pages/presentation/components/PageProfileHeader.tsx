import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { Badge } from "@/shared/ui/badge";
import { useTranslations } from "next-intl";
import type { Page } from "@/modules/pages/domain/page.types";

/**
 * En-tête de page publique, façon profil Instagram, sur une carte opaque :
 * avatar, nom et type, compteurs en blocs, bio.
 */
export function PageProfileHeader({
  page,
  eventCount,
  memberCount,
}: {
  page: Page;
  eventCount: number;
  memberCount: number;
}) {
  const t = useTranslations("pages");
  return (
    <header className="grid gap-4 rounded-card bg-card p-4 shadow-card sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-8 sm:p-6">
      <div className="flex items-center gap-4 sm:row-span-3">
        <ProfileAvatar name={page.name} photo={page.photoUrl} size="xl" />
        <div className="grid gap-1.5 sm:hidden">
          <h1 className="text-xl font-bold">{page.name}</h1>
          <Badge variant="secondary" className="w-fit">
            {t(`types.${page.type}`)}
          </Badge>
        </div>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <h1 className="text-2xl font-bold">{page.name}</h1>
        <Badge variant="secondary">{t(`types.${page.type}`)}</Badge>
      </div>
      <ul className="grid grid-cols-2 gap-2 text-sm sm:flex">
        <li className="rounded-2xl bg-muted px-4 py-3 font-semibold">
          {t("public.events", { n: eventCount })}
        </li>
        <li className="rounded-2xl bg-muted px-4 py-3 text-muted-foreground">
          {t("public.members", { n: memberCount })}
        </li>
      </ul>
      {page.description && (
        <p className="max-w-prose text-sm whitespace-pre-line">
          {page.description}
        </p>
      )}
    </header>
  );
}
