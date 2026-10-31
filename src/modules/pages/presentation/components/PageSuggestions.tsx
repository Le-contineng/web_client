import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import type { PageSuggestion } from "@/modules/pages/domain/page.types";
import { FollowButton } from "@/modules/pages/presentation/components/FollowButton";

/**
 * Pages à suivre (ADR 0019), quand l'onglet « Abonnements » est vide : les
 * plus actives, chacune avec son bouton « Suivre ». Après un clic, la page est
 * relue et l'onglet se remplit.
 */
export function PageSuggestions({ pages }: { pages: PageSuggestion[] }) {
  const t = useTranslations("pages.follow");
  if (!pages.length) return null;
  return (
    <section className="grid gap-3">
      <h2 className="px-4 font-semibold sm:px-0">{t("suggestionsTitle")}</h2>
      <ul className="divide-y overflow-hidden border-y bg-card sm:rounded-xl sm:border">
        {pages.map((page) => (
          <li key={page.id} className="flex items-center gap-3 px-4 py-3">
            <Link
              href={`/p/${page.slug}`}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <ProfileAvatar name={page.name} photo={page.photoUrl} size="md" />
              <span className="min-w-0">
                <span className="block truncate font-semibold hover:underline">
                  {page.name}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {t("upcomingEvents", { n: page.upcomingEventCount })}
                </span>
              </span>
            </Link>
            <FollowButton slug={page.slug} following={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}
