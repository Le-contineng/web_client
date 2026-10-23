import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/modules/auth/application/auth.actions";
import { NotificationBell } from "@/modules/notifications";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/shared/components/ThemeSwitcher";
import { Logo } from "@/shared/components/layout/Logo";
import { buttonVariants } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { AccountMenu } from "@/spaces/user/components/AccountMenu";
import { MobileHeaderFrame } from "@/spaces/user/components/MobileHeaderFrame";
import {
  getNavigation,
  notificationActions,
} from "@/spaces/user/components/navigation";

async function MobileHeaderActions() {
  const { t, account, unread } = await getNavigation();
  return account ? (
    <>
      <NotificationBell initialUnread={unread} actions={notificationActions} />
      <AccountMenu
        name={account.name}
        photo={account.photoUrl}
        isAdmin={account.isAdmin}
        logout={logoutAction}
      />
    </>
  ) : (
    <>
      <ThemeSwitcher />
      <LanguageSwitcher />
      <Link
        href="/login"
        className={buttonVariants({
          variant: "glass-primary",
          size: "pill",
          className: "px-4 text-sm",
        })}
      >
        {t("nav.login")}
      </Link>
    </>
  );
}

/**
 * En-tête sur téléphone : bande de verre collante, logo, puis notifications
 * et menu du compte (ou thème, langue et connexion pour un visiteur).
 */
export function MobileHeader() {
  return (
    <MobileHeaderFrame>
      <div className="flex h-15 items-center gap-1.5 px-3 sm:px-4">
        {/* Logo seul : le nom de l'application ferait déborder l'en-tête. */}
        <Logo compact />
        <div className="ml-auto flex min-w-0 items-center gap-1.5">
          <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
            <MobileHeaderActions />
          </Suspense>
        </div>
      </div>
    </MobileHeaderFrame>
  );
}
