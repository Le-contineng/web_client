import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentAccount } from "@/modules/authentication/server";
import { getAllPages } from "@/modules/pages/server";
import { MySuggestionList, readPageIndex } from "@/modules/suggestions";
import { getMySuggestions } from "@/modules/suggestions/server";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";
import { PageTitle } from "@/shared/components/layout/PageTitle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("suggestions");
  return { title: t("mine"), robots: { index: false } };
}

/** « Mes suggestions » : celles que la personne a laissées, leur état et la réponse. */
async function MySuggestions({ searchParams }: PageProps<"/my-suggestions">) {
  if (!(await getCurrentAccount())) redirect("/login?returnTo=/my-suggestions");
  const t = await getTranslations("suggestions");
  const page = readPageIndex((await searchParams).page);
  const [list, pages] = await Promise.all([
    getMySuggestions(page),
    getAllPages(),
  ]);
  return (
    <div className="mx-auto grid max-w-xl gap-6 px-4 pt-6 pb-24 md:pt-10">
      <PageTitle title={t("mine")} returnTo="/more" />
      <MySuggestionList
        list={list}
        pageNames={Object.fromEntries(pages.map((p) => [p.id, p.name]))}
        basePath="/my-suggestions"
      />
    </div>
  );
}

export default function Page(props: PageProps<"/my-suggestions">) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <MySuggestions {...props} />
    </Suspense>
  );
}
