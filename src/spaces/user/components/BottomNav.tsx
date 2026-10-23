import { UserIcon } from "lucide-react";
import { NavLink } from "@/spaces/user/components/NavLink";
import { TabBar } from "@/spaces/user/components/TabBar";
import { getNavigation } from "@/spaces/user/components/navigation";

/** Barre d'onglets flottante en bas de l'écran sur téléphone. */
export async function BottomNav() {
  const { t, account, links } = await getNavigation();
  return (
    <TabBar label={t("nav.main")} count={links.length + 1}>
      {links.map((l) => (
        <NavLink key={l.href} {...l} variant="bottom" />
      ))}
      <NavLink
        href={account ? "/profile" : "/register"}
        icon={<UserIcon />}
        label={account ? t("nav.profile") : t("nav.register")}
        variant="bottom"
      />
    </TabBar>
  );
}
