import { PlusIcon } from "@/shared/components/icons";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MemberPageList } from "@/modules/pages";
import { buttonVariants } from "@/shared/ui/button";
import { getCurrentUser } from "@/modules/pages/server";
import { PageTitle } from "@/shared/components/layout/PageTitle";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/** « Mes pages » : les pages dont on est membre, point d'entrée de leur gestion (US-06, US-39). */
async function MyPages() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/my-pages");
  const t = await getTranslations();
  return (
    <div className="mx-auto grid max-w-2xl gap-4 px-4 pt-6 md:pt-10">
      <PageTitle
        title={t("pages.myPages.title")}
        subtitle={t("pages.myPages.intro")}
      />
      {user.pages.length === 0 ? (
        <p className="rounded-xl border bg-muted/40 p-4 text-sm">
          {t("pages.myPages.empty")}
        </p>
      ) : (
        <MemberPageList
          pages={user.pages}
          link={(p) => `/studio/${encodeURIComponent(p.slug)}`}
        />
      )}
      <Link
        href="/page-request"
        className={buttonVariants({
          variant: "outline",
          className: "justify-self-start",
        })}
      >
        <PlusIcon /> {t("nav.requestPage")}
      </Link>
    </div>
  );
}

/** La session est lue dans MesPages, derrière ce Suspense (Cache Components). */
export default function Page() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <MyPages />
    </Suspense>
  );
}
