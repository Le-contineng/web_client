import { Suspense } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@/shared/components/icons";
import { Logo } from "@/shared/components/layout/Logo";
import { buttonVariants } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AutoHideHeader } from "@/spaces/user/components/AutoHideHeader";
import { FeedTabs } from "@/spaces/user/components/FeedTabs";
import { getNavigation } from "@/spaces/user/components/navigation";

async function MobileFeedTabs() {
  const { account } = await getNavigation();
  return <FeedTabs withFollowing={!!account} className="h-full" />;
}

async function MobileHeaderActions() {
  const { t, account } = await getNavigation();
  // Avatar et notifications sont dans la barre du bas : pas de doublon ici
  const search = (
    <Link
      href="/search"
      aria-label={t("nav.search")}
      className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
    >
      <MagnifyingGlassIcon className="size-6" />
    </Link>
  );
  return account ? (
    search
  ) : (
    <>
      {search}
      {/* Lien classique : sur téléphone, la connexion s'ouvre en page entière,
          pas en modal (src/app/@auth) */}
      <a href="/login" className={buttonVariants({ size: "sm" })}>
        {t("nav.login")}
      </a>
    </>
  );
}

/**
 * En-tête sur téléphone, sur le fil seulement, façon TikTok : logo à gauche,
 * onglets du fil au centre, recherche à droite (plus la connexion
 * pour un visiteur ; thème et langue sont dans « Plus »). Il reste visible au défilement.
 */
export function MobileHeader() {
  return (
    <AutoHideHeader>
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        {/* Logo seul : le nom de l'application ferait déborder l'en-tête. */}
        <Logo compact />
        <div className="h-full min-w-0 flex-1">
          <Suspense>
            <MobileFeedTabs />
          </Suspense>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <MobileHeaderActions />
          </Suspense>
        </div>
      </div>
    </AutoHideHeader>
  );
}
