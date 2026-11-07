import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageEditForm } from "@/modules/pages";
import { updatePageAction } from "@/modules/pages/application/pages.actions";
import { getMyPage, getMyPages, getPageBySlug } from "@/modules/pages/server";
import { UrlToast } from "@/shared/components/UrlToast";
import { StudioHeader } from "@/spaces/organizer";

/** Rubrique « Page » : photo, nom, type et bio, réservée au propriétaire. */
async function StudioPage({ params }: PageProps<"/studio/[slug]/profil">) {
  const { slug } = await params;
  const [page, pages, detail] = await Promise.all([
    getMyPage(slug),
    getMyPages(),
    getPageBySlug(slug),
  ]);
  if (!page || !detail) notFound();
  const t = await getTranslations();
  return (
    <>
      <UrlToast messages={{ pageUpdated: t("pages.edit.saved") }} />
      <StudioHeader page={page} pages={pages} section="page" />
      <div className="px-4 py-5 sm:px-6">
        {page.role !== "owner" ? (
          <p className="text-sm text-muted-foreground">
            {t("pages.edit.ownerOnly")}
          </p>
        ) : (
          <PageEditForm
            page={detail.page}
            action={updatePageAction.bind(null, detail.page.id)}
          />
        )}
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/studio/[slug]/profil">) {
  return (
    <Suspense>
      <StudioPage {...props} />
    </Suspense>
  );
}
