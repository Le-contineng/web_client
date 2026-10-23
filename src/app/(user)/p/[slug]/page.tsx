import { FlagOffIcon, Grid3x3Icon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EventGrid } from "@/modules/events";
import { getPageEvents } from "@/modules/events/server";
import { PageProfileHeader } from "@/modules/pages";
import { getPageBySlug } from "@/modules/pages/server";
import { buttonVariants } from "@/shared/ui/button";
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
        <FlagOffIcon className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t("pages.public.notFound")}</h1>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          {t("events.backToList")}
        </Link>
      </div>
    );
  }
  const { page, memberCount } = detail;
  const events = await getPageEvents(page.slug);
  return (
    <div className="mx-auto grid max-w-4xl gap-3 px-3 pt-3 sm:px-6 md:pt-6">
      <PageProfileHeader
        page={page}
        eventCount={events.length}
        memberCount={memberCount}
      />
      <h2 className="flex items-center justify-center gap-2 pt-3 text-xs font-bold tracking-widest uppercase">
        <Grid3x3Icon className="size-3.5" /> {t("events.listTitle")}
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
