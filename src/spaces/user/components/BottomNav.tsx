import { BellIcon, UserIcon } from "@/shared/components/icons";
import { UnreadBadge } from "@/modules/notifications";
import { NavLink } from "@/spaces/user/components/NavLink";
import { getNavigation } from "@/spaces/user/components/navigation";

/**
 * Barre de navigation en bas de l'écran sur téléphone. Avec un compte, les
 * notifications prennent la place de la recherche, passée dans l'en-tête.
 */
export async function BottomNav() {
  const { t, account, unread, links } = await getNavigation();
  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {links.map((l) =>
        account && l.href === "/search" ? (
          <NavLink
            key="/notifications"
            href="/notifications"
            icon={
              <span className="relative">
                <BellIcon />
                <UnreadBadge count={unread} />
              </span>
            }
            activeIcon={
              <span className="relative">
                <BellIcon weight="fill" />
              </span>
            }
            label={t("notifications.title")}
            variant="bottom"
          />
        ) : (
          <NavLink key={l.href} {...l} variant="bottom" />
        ),
      )}
      <NavLink
        href={account ? "/profile" : "/register"}
        icon={<UserIcon />}
        activeIcon={<UserIcon weight="fill" />}
        label={account ? t("nav.profile") : t("nav.register")}
        variant="bottom"
      />
    </nav>
  );
}
