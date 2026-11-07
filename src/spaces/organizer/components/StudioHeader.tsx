import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { MemberPage } from "@/modules/pages";
import { ArrowSquareOutIcon, PlusIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { PageSwitcher } from "@/spaces/organizer/components/PageSwitcher";

export type StudioSection = "events" | "audience" | "team" | "page";

/**
 * En-tête de l'espace organisateur : la page gérée (et le passage à une
 * autre), la seule action fuchsia de l'écran, « Publier », puis les
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
  const sections: { id: StudioSection; href: string; label: string }[] = [
    { id: "events", href: `/studio/${slug}`, label: t("sections.events") },
    {
      id: "audience",
      href: `/studio/${slug}/audience`,
      label: t("sections.audience"),
    },
    { id: "team", href: `/studio/${slug}/equipe`, label: t("sections.team") },
    ...(page.role === "owner"
      ? [
          {
            id: "page" as const,
            href: `/studio/${slug}/profil`,
            label: t("sections.page"),
          },
        ]
      : []),
  ];
  return (
    <header className="border-b bg-background">
      <div className="flex items-center gap-2 px-4 pt-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <PageSwitcher current={page} pages={pages} />
        </div>
        <Link
          href={`/p/${slug}`}
          aria-label={t("viewPublic")}
          title={t("viewPublic")}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowSquareOutIcon />
        </Link>
        <Link
          href={`/studio/${slug}/evenements/nouveau`}
          className={buttonVariants({ className: "shrink-0" })}
        >
          <PlusIcon weight="bold" /> {t("publish")}
        </Link>
      </div>
      <nav
        aria-label={t("sectionsLabel")}
        className="mt-3 flex [scrollbar-width:none] gap-1 overflow-x-auto px-2 sm:px-4"
      >
        {sections.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            aria-current={s.id === section ? "page" : undefined}
            className={cn(
              "relative shrink-0 rounded-md px-3 pt-2 pb-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              s.id === section
                ? "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
