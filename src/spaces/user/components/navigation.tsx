import {
  HomeIcon,
  LayoutGridIcon,
  PlusSquareIcon,
  SearchIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import {
  countNotificationsAction,
  listNotificationsAction,
  markNotificationsReadAction,
} from "@/modules/notifications/application/notifications.actions";
import { countUnread } from "@/modules/notifications/server";
import { getCurrentUser } from "@/modules/pages/server";

/** Server Actions de la cloche de notifications. */
export const notificationActions = {
  count: countNotificationsAction,
  list: listNotificationsAction,
  markRead: markNotificationsReadAction,
};

/**
 * Lit une fois par requête la personne connectée et ses liens. « Créer » est
 * visible par tous : le choix de la page se fait à l'étape suivante.
 */
export const getNavigation = cache(async () => {
  const t = await getTranslations();
  const user = await getCurrentUser();
  const account = user?.account ?? null;
  const unread = account ? await countUnread() : 0;

  const links = [
    { href: "/", icon: <HomeIcon />, label: t("nav.home") },
    { href: "/search", icon: <SearchIcon />, label: t("nav.search") },
    {
      href: "/events/new",
      icon: <PlusSquareIcon />,
      label: t("nav.create"),
    },
    ...(account
      ? [
          {
            href: "/my-pages",
            icon: <LayoutGridIcon />,
            label: t("nav.myPages"),
          },
        ]
      : []),
  ];

  return { t, account, unread, links };
});
