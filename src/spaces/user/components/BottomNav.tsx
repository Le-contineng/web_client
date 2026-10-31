import { UserIcon } from "@/shared/components/icons";
import { NavLink } from "@/spaces/user/components/NavLink";
import { getNavigation } from "@/spaces/user/components/navigation";

/** Barre de navigation en bas de l'écran sur téléphone. */
export async function BottomNav() {
  const { t, account, links } = await getNavigation();
  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {links.map((l) => (
        <NavLink key={l.href} {...l} variant="bottom" />
      ))}
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
