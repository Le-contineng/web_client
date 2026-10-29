import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { Badge } from "@/shared/ui/badge";
import type { Page } from "@/modules/pages/domain/page.types";

/**
 * En-tête d'une page façon profil Instagram : avatar, compteurs, nom, type,
 * bio et boutons (« Modifier la page » pour le propriétaire). Sur mobile,
 * l'avatar et les compteurs partagent la première ligne, les boutons
 * prennent toute la largeur sous la bio.
 */
export function PageProfileHeader({
  page,
  eventCount,
  memberCount,
  viewCount,
  actions,
}: {
  page: Page;
  eventCount: number;
  memberCount: number;
  /** Total des vues, montré à ses membres seulement. */
  viewCount?: number;
  actions?: ReactNode;
}) {
  const t = useTranslations("pages");
  const stats: { key: "events" | "members" | "views"; value: number }[] = [
    { key: "events", value: eventCount },
    { key: "members", value: memberCount },
    ...(viewCount === undefined
      ? []
      : [{ key: "views" as const, value: viewCount }]),
  ];
  const statList = (
    <ul className="flex flex-1 justify-around gap-6 text-center sm:flex-none sm:justify-start sm:gap-10 sm:text-left">
      {stats.map((s) => (
        <li key={s.key} className="grid sm:flex sm:gap-1.5">
          <span className="font-semibold">{s.value}</span>
          <span className="text-sm text-muted-foreground sm:text-base sm:text-foreground">
            {t(`stats.${s.key}`, { n: s.value })}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <header className="grid gap-4 px-4 py-6 sm:flex sm:items-start sm:gap-12 sm:px-0 sm:py-8">
      <div className="flex items-center gap-6 sm:block">
        <ProfileAvatar
          name={page.name}
          photo={page.photoUrl}
          size="xl"
          className="sm:size-36 sm:text-4xl"
        />
        <div className="flex flex-1 sm:hidden">{statList}</div>
      </div>
      <div className="grid flex-1 gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="text-xl font-semibold">{page.name}</h1>
          {actions && (
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {actions}
            </div>
          )}
        </div>
        <div className="hidden sm:block">{statList}</div>
        <div className="grid gap-1.5">
          <Badge variant="secondary" className="w-fit">
            {t(`types.${page.type}`)}
          </Badge>
          <p className="max-w-prose text-sm whitespace-pre-line">
            {page.description}
          </p>
          <p className="text-sm text-muted-foreground">@{page.slug}</p>
        </div>
        {actions && (
          <div className="flex gap-2 sm:hidden [&>*]:flex-1">{actions}</div>
        )}
      </div>
    </header>
  );
}
