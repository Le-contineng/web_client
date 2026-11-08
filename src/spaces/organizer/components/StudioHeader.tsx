import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { MemberPage } from "@/modules/pages";
import { PlusIcon } from "@/shared/components/icons";
import { buttonVariants } from "@/shared/ui/button";
import {
  StudioMenu,
  type StudioSection,
} from "@/spaces/organizer/components/StudioMenu";
import { PageSwitcher } from "@/spaces/organizer/components/PageSwitcher";

export type { StudioSection };

/**
 * En-tête de l'espace organisateur : la page gérée (et le passage à une
 * autre), « Publier » sur la rubrique Événements (la seule action fuchsia
 * de l'écran), puis les
 * rubriques de l'espace, communes à toutes ses adresses.
 */
export async function StudioHeader({
  page,
  pages,
  section,
}: {
  page: MemberPage;
  pages: MemberPage[];
  section: StudioSection;
}) {
  const t = await getTranslations("studio");
  const slug = encodeURIComponent(page.slug);
  return (
    <header className="bg-background">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <PageSwitcher current={page} pages={pages} />
        </div>
        <StudioMenu
          slug={slug}
          owner={page.role === "owner"}
          section={section}
        />
        {/* Seul fuchsia de l'écran, et seulement là où l'on publie : sur les
            autres rubriques, l'action de l'écran est la leur. Sur téléphone,
            c'est le bouton flottant « + » de la liste qui publie. */}
        {section === "events" && (
          <Link
            href={`/studio/${slug}/evenements/nouveau`}
            className={buttonVariants({ className: "shrink-0 max-sm:hidden" })}
          >
            <PlusIcon weight="bold" /> {t("publish")}
          </Link>
        )}
      </div>
    </header>
  );
}
