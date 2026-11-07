import { Suspense } from "react";
import { NotificationBell } from "@/modules/notifications";
import { DotsThreeIcon } from "@/shared/components/icons";
import { Logo } from "@/shared/components/layout/Logo";
import { buttonVariants } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AutoHideHeader } from "@/spaces/user/components/AutoHideHeader";
import {
  getNavigation,
  notificationActions,
} from "@/spaces/user/components/navigation";

async function MobileHeaderActions() {
  const { t, account, unread } = await getNavigation();
  // L'avatar est dans la barre du bas (Profil) : pas de doublon ici
  return account ? (
    <NotificationBell initialUnread={unread} actions={notificationActions} />
  ) : (
    <>
      {/* Thème et langue dans « Plus » : à côté du nom de l'application, ils
          feraient déborder l'en-tête d'un téléphone */}
      <a
        href="/more"
        aria-label={t("nav.more")}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <DotsThreeIcon className="size-6" />
      </a>
      {/* Lien classique : sur téléphone, la connexion s'ouvre en page entière,
          pas en modal (src/app/@auth) */}
      <a href="/login" className={buttonVariants({ size: "sm" })}>
        {t("nav.login")}
      </a>
    </>
  );
}

/**
 * En-tête sur téléphone, sur l'accueil seulement : logo et nom de
 * l'application, puis notifications (ou « Plus », avec le thème et la
 * langue, et la connexion pour un visiteur). Sans bordure ; il s'efface au
 * défilement vers le bas.
 */
export function MobileHeader() {
  return (
    <AutoHideHeader>
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Logo />
        <div className="ml-auto flex min-w-0 items-center gap-1">
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <MobileHeaderActions />
          </Suspense>
        </div>
      </div>
    </AutoHideHeader>
  );
}
