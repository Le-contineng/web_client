import {
  HouseLineIcon,
  MagnifyingGlassIcon,
  PlusSquareIcon,
  SquaresFourIcon,
} from "@/shared/components/icons";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import {
  listNotificationsAction,
  markNotificationsReadAction,
} from "@/modules/notifications/application/notifications.actions";
import { countUnread } from "@/modules/notifications/server";
import { getCurrentUser } from "@/modules/pages/server";

/** Server Actions de la cloche de notifications. */
export const notificationActions = {
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
    {
      href: "/",
      icon: <HouseLineIcon />,
      activeIcon: <HouseLineIcon weight="fill" />,
      label: t("nav.home"),
    },
    {
      href: "/search",
      icon: <MagnifyingGlassIcon />,
      activeIcon: <MagnifyingGlassIcon weight="bold" />,
      label: t("nav.search"),
    },
    {
      // Sans compte, la connexion s'ouvre en modal (une redirection du
      // serveur afficherait la page /login entière).
      href: account ? "/events/new" : "/login?returnTo=%2Fevents%2Fnew",
      icon: <PlusSquareIcon />,
      activeIcon: <PlusSquareIcon weight="fill" />,
      label: t("nav.create"),
    },
    ...(account
      ? [
          {
            href: "/my-pages",
            also: ["/studio"],
            icon: <SquaresFourIcon />,
            activeIcon: <SquaresFourIcon weight="fill" />,
            label: t("nav.myPages"),
          },
        ]
      : []),
  ];

  return { t, account, unread, links };
});
