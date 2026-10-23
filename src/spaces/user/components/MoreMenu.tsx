"use client";

import { EllipsisIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { MoreMenuContent } from "@/spaces/user/components/MoreMenuContent";
import { SIDEBAR_LABEL } from "@/spaces/user/components/sidebar-classes";
import { drawerTriggerClass } from "@/spaces/user/components/SidebarDrawer";
import { useSidebarPanel } from "@/spaces/user/components/sidebar-panel";

/**
 * Entrée « Plus » de la barre latérale : popover de verre qui naît du bouton
 * (réglages, compte, connexion ou déconnexion).
 */
export function MoreMenu({
  signedIn,
  isAdmin,
  logout,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const { setPanel } = useSidebarPanel();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Un seul panneau à la fois : le tiroir des notifications se ferme.
        if (next) setPanel(null);
        setOpen(next);
      }}
    >
      <PopoverTrigger
        aria-label={t("more")}
        className={drawerTriggerClass(open)}
      >
        <EllipsisIcon />
        <span className={SIDEBAR_LABEL}>{t("more")}</span>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="ct-sheet ct-menu w-[340px] gap-0 p-0 py-1 text-base"
      >
        <MoreMenuContent
          signedIn={signedIn}
          isAdmin={isAdmin}
          logout={logout}
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
