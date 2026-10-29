import { FlagBannerIcon, GridNineIcon } from "@/shared/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EventGrid } from "@/modules/events";
import { getPageEvents } from "@/modules/events/server";
import { PageProfileHeader } from "@/modules/pages";
import { getMyPage, getPageBySlug } from "@/modules/pages/server";
import { buttonVariants } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { BackBar } from "@/shared/components/layout/BackBar";
import { Suspense } from "react";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

export async function generateMetadata({
  params,
}: PageProps<"/p/[slug]">): Promise<Metadata> {
  const detail = await getPageBySlug((await params).slug);
  return detail
    ? { title: detail.page.name, description: detail.page.description }
    : {};
}

/** Page publique d'une page organisatrice, façon profil Instagram. */
async function PublicPage({ params }: PageProps<"/p/[slug]">) {
  const t = await getTranslations();
  const detail = await getPageBySlug((await params).slug);
  if (!detail) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <FlagBannerIcon className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t("pages.public.notFound")}</h1>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          {t("events.backToList")}
        </Link>
      </div>
    );
  }
  const { page, memberCount } = detail;
  const events = await getPageEvents(page.slug);
  // Ses membres retrouvent ici « Modifier la page » (propriétaire) et la gestion
  const membership = await getMyPage(page.slug);
  const secondary = buttonVariants({ variant: "secondary", size: "sm" });
  return (
    <div className="mx-auto max-w-4xl sm:px-6 md:pt-6">
      <BackBar title={page.name} />
      <PageProfileHeader
        page={page}
        eventCount={events.length}
        memberCount={memberCount}
        actions={
          membership && (
            <>
              {membership.role === "owner" && (
                <Link
                  href={`/my-pages/${page.slug}/edit`}
                  className={secondary}
                >
                  {t("pages.edit.action")}
                </Link>
              )}
              <Link href={`/my-pages/${page.slug}`} className={secondary}>
                {t("pages.myPages.manage")}
              </Link>
            </>
          )
        }
      />
      <Separator />
      <h2 className="flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase">
        <GridNineIcon className="size-3.5" /> {t("events.listTitle")}
      </h2>
      {events.length ? (
        <EventGrid events={events} className="lg:grid-cols-3 xl:grid-cols-3" />
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("pages.public.noEvents")}
        </p>
      )}
    </div>
  );
}

/**
 * Les paramètres d'URL et la session sont lus dans PagePublique, derrière ce
 * Suspense : le cadre de la page reste instantané (Cache Components).
 */
export default function Page(props: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <PublicPage {...props} />
    </Suspense>
  );
}
