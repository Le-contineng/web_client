import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentAccount } from "@/modules/authentication/server";
import { ProfileForm } from "@/modules/profiles";
import { updateProfileAction } from "@/modules/profiles/application/profiles.actions";
import { ListIcon } from "@/shared/components/icons";
import { UrlToast } from "@/shared/components/UrlToast";
import { PageTitle } from "@/shared/components/layout/PageTitle";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";

/**
 * Profil personnel : nom et photo. Sur téléphone, le bouton menu en haut
 * ouvre « Plus » (réglages, notifications, appareils connectés, déconnexion),
 * l'équivalent du tiroir « Plus » de la barre latérale sur ordinateur.
 */
async function Profile() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login?returnTo=/profile");
  const t = await getTranslations();
  return (
    <div className="mx-auto grid max-w-xl gap-8 px-4 pt-6 md:pt-10">
      <UrlToast
        messages={{
          profileSaved: t("auth.profileSaved"),
          emailVerified: t("auth.emailVerified"),
        }}
      />
      <PageTitle
        title={t("auth.myProfile")}
        subtitle={account.email}
        action={
          <Link
            href="/more"
            aria-label={t("more.menu")}
            title={t("more.menu")}
            className="grid size-10 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden [&_svg]:size-6"
          >
            <ListIcon />
          </Link>
        }
      />
      <ProfileForm
        key={`${account.name}-${account.photoUrl}`}
        action={updateProfileAction}
        name={account.name}
        photo={account.photoUrl}
      />
    </div>
  );
}

/** La session est lue dans Profil, derrière ce Suspense (Cache Components). */
export default function Page() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Profile />
    </Suspense>
  );
}
