import { CaretRightIcon } from "@/shared/components/icons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import type { Page } from "@/modules/pages/domain/page.types";

/** « Pages suivies » du profil (ADR 0019) : chaque ligne mène à la page. */
export function FollowedPageList({ pages }: { pages: Page[] }) {
  const t = useTranslations("pages");
  if (!pages.length) {
    return (
      <p className="rounded-xl border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        {t("follow.none")}
      </p>
    );
  }
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {pages.map((page) => (
        <li key={page.id}>
          <Link
            href={`/p/${page.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
          >
            <ProfileAvatar name={page.name} photo={page.photoUrl} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{page.name}</span>
              <span className="block truncate text-sm text-muted-foreground">
                @{page.slug} · {t(`types.${page.type}`)}
              </span>
            </span>
            <CaretRightIcon className="size-5 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
