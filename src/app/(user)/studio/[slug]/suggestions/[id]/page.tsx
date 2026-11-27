import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMyPage } from "@/modules/pages/server";
import { SuggestionDetail } from "@/modules/suggestions";
import { openSuggestion } from "@/modules/suggestions/server";
import { StudioTaskHeader } from "@/spaces/organizer";

/** Détail d'une suggestion : l'ouvrir la marque lue ; on y répond une seule fois. */
async function StudioSuggestion({
  params,
}: PageProps<"/studio/[slug]/suggestions/[id]">) {
  const { slug, id } = await params;
  const page = await getMyPage(slug);
  if (!page) notFound();
  const suggestion = await openSuggestion(page.id, id);
  if (!suggestion) notFound();
  const t = await getTranslations("suggestions");
  return (
    <>
      <StudioTaskHeader
        page={page}
        back={{
          label: t("boxTitle"),
          href: `/studio/${encodeURIComponent(page.slug)}/suggestions`,
        }}
        title={t("detailTitle")}
      />
      <div className="px-4 py-5 sm:px-6">
        <SuggestionDetail suggestion={suggestion} />
      </div>
    </>
  );
}

export default function Page(
  props: PageProps<"/studio/[slug]/suggestions/[id]">,
) {
  return (
    <Suspense>
      <StudioSuggestion {...props} />
    </Suspense>
  );
}
