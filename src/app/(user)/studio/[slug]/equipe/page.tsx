import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccessManager } from "@/modules/pages";
import {
  grantAccessAction,
  revokeAccessAction,
  searchUsersAction,
} from "@/modules/pages/application/pages.actions";
import { getMembers, getMyPage, getMyPages } from "@/modules/pages/server";
import { StudioHeader } from "@/spaces/organizer";

/** Rubrique « Équipe » : les membres de la page ; seul le propriétaire les gère (US-06). */
async function StudioTeam({ params }: PageProps<"/studio/[slug]/equipe">) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getMyPage(slug), getMyPages()]);
  if (!page) notFound();
  const t = await getTranslations();
  return (
    <>
      <StudioHeader page={page} pages={pages} section="team" />
      <div className="grid gap-4 px-4 py-5 sm:px-6">
        {page.role !== "owner" ? (
          <p className="text-sm text-muted-foreground">
            {t("studio.ownerOnlyTeam")}
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("pages.access.intro")}
            </p>
            <AccessManager
              members={await getMembers(page.id)}
              search={searchUsersAction.bind(null, page.id)}
              grant={grantAccessAction.bind(null, page.id)}
              remove={revokeAccessAction.bind(null, page.id)}
            />
          </>
        )}
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/studio/[slug]/equipe">) {
  return (
    <Suspense>
      <StudioTeam {...props} />
    </Suspense>
  );
}
