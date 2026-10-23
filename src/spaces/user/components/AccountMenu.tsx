"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlassSheet } from "@/shared/components/GlassSheet";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { MoreMenuContent } from "@/spaces/user/components/MoreMenuContent";

/**
 * Menu du compte dans l'en-tête mobile : l'avatar de la personne connectée
 * ouvre la feuille « Plus » (réglages, profil, page, administration,
 * déconnexion), la même que sur ordinateur.
 */
export function AccountMenu({
  name,
  photo,
  isAdmin,
  logout,
}: {
  name: string;
  photo: string | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={t("profile")}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="ct-press grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ProfileAvatar name={name} photo={photo} size="sm" />
      </button>
      <GlassSheet open={open} onOpenChange={setOpen} title={t("more")}>
        <MoreMenuContent
          signedIn
          isAdmin={isAdmin}
          logout={logout}
          onNavigate={() => setOpen(false)}
        />
      </GlassSheet>
    </>
  );
}
