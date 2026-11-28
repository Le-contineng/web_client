import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ExpandableText } from "@/shared/components/ExpandableText";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import type { Page } from "@/modules/pages/domain/page.types";

/**
 * En-tête d'une page, façon profil de réseau social : la photo à gauche (avec
 * sa pastille éventuelle), et à sa droite le nom puis les compteurs (chiffre
 * au-dessus du libellé) ; dessous, le type, la bio repliable et l'adresse ;
 * enfin les boutons, de largeur égale. Même structure sur ordinateur, centrée
 * et plus grande. Le nombre de membres n'est jamais montré.
 */
export function PageProfileHeader({
  page,
  eventCount,
  followerCount,
  viewCount,
  actions,
  avatarBadge,
}: {
  page: Page;
  eventCount: number;
  /** Nombre d'abonnés, public (ADR 0019) ; absent là où il n'est pas lu. */
  followerCount?: number;
  /** Total des vues, montré à ses membres seulement. */
  viewCount?: number;
  actions?: ReactNode;
  /** Posé en bas à droite de la photo (ex. « Faire une suggestion »). */
  avatarBadge?: ReactNode;
}) {
  const t = useTranslations("pages");
  const stats: { key: "events" | "followers" | "views"; value: number }[] = [
    { key: "events", value: eventCount },
    ...(followerCount === undefined
      ? []
      : [{ key: "followers" as const, value: followerCount }]),
    ...(viewCount === undefined
      ? []
      : [{ key: "views" as const, value: viewCount }]),
  ];
  return (
    <header className="mx-auto grid w-full max-w-2xl gap-4 px-4 py-5 sm:gap-5 sm:py-8">
      <div className="flex items-center gap-5 sm:gap-10">
        <div className="relative w-fit shrink-0">
          <ProfileAvatar
            name={page.name}
            photo={page.photoUrl}
            size="xl"
            className="size-[5.5rem] sm:size-32 sm:text-4xl"
          />
          {avatarBadge}
        </div>
        <div className="grid min-w-0 flex-1 gap-2 sm:gap-3">
          <h1 className="truncate text-base font-semibold sm:text-xl">
            {page.name}
          </h1>
          <ul className="flex gap-8 sm:gap-12">
            {stats.map((s) => (
              <li key={s.key} className="grid leading-tight">
                <span className="text-base font-semibold tabular-nums sm:text-lg">
                  {s.value}
                </span>
                <span className="text-sm">
                  {t(`stats.${s.key}`, { n: s.value })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-1 text-sm">
        <p className="text-muted-foreground">{t(`types.${page.type}`)}</p>
        {page.description && (
          <ExpandableText text={page.description} lines={4} />
        )}
        <p className="text-muted-foreground">@{page.slug}</p>
      </div>
      {actions && (
        // Boutons de largeur égale, côte à côte
        <div className="grid auto-cols-fr grid-flow-col gap-2 [&>*]:h-9 [&>*]:w-full">
          {actions}
        </div>
      )}
    </header>
  );
}
