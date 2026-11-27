import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMyPage, getMyPages } from "@/modules/pages/server";
import {
  PageSuggestionList,
  readPageIndex,
  readStatusFilter,
  SuggestionBoxToggle,
} from "@/modules/suggestions";
import {
  getPageSuggestions,
  isSuggestionBoxOpen,
} from "@/modules/suggestions/server";
import { StudioHeader } from "@/spaces/organizer";

/**
 * Rubrique « Boîte à suggestions » : les suggestions reçues par la page,
 * pour tous ses membres ; le propriétaire ouvre ou ferme la boîte.
 */
async function StudioSuggestions({
  params,
  searchParams,
}: PageProps<"/studio/[slug]/suggestions">) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getMyPage(slug), getMyPages()]);
  if (!page) notFound();
  const query = await searchParams;
  const status = readStatusFilter(query.status);
  const t = await getTranslations("suggestions");
  const [list, open] = await Promise.all([
    getPageSuggestions(page.id, status, readPageIndex(query.page)),
    isSuggestionBoxOpen(page.id),
  ]);
  return (
    <>
      <StudioHeader page={page} pages={pages} section="suggestions" />
      <div className="grid gap-5 px-4 py-5 sm:px-6">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("boxTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("boxIntro")}</p>
        </div>
        {page.role === "owner" && (
          <SuggestionBoxToggle pageId={page.id} open={open} />
        )}
        <PageSuggestionList
          list={list}
          status={status}
          basePath={`/studio/${encodeURIComponent(page.slug)}/suggestions`}
        />
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/studio/[slug]/suggestions">) {
  return (
    <Suspense>
      <StudioSuggestions {...props} />
    </Suspense>
  );
}
