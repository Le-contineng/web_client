"use client";

import {
  BellIcon,
  CaretRightIcon,
  ChatBubbleIcon,
  DeviceMobileIcon,
  FlagIcon,
  MoonIcon,
  ShieldIcon,
  SignInIcon,
  SignOutIcon,
  TranslateIcon,
  UserIcon,
  UserPlusIcon,
} from "@/shared/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useTransition } from "react";
import { ThemeSwitcher } from "@/shared/components/ThemeSwitcher";
import { changeLocale } from "@/shared/i18n/actions";

/**
 * Contenu du menu « Plus » : réglages (langue, D2 ; thème, ADR 0006), compte
 * (profil, demande de page, notifications, appareils connectés,
 * administration), connexion ou déconnexion. Le même dans le tiroir de la
 * barre latérale (ordinateur) et sur la page /more (téléphone, ouverte
 * depuis le profil).
 */
export function MoreSections({
  signedIn,
  isAdmin,
  logout,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const other = locale === "fr" ? "en" : "fr";

  return (
    <>
      <Group title={t("more.settings")}>
        <Row
          icon={<TranslateIcon />}
          onClick={() =>
            startTransition(async () => {
              await changeLocale(other);
              router.refresh();
            })
          }
          trailing={
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <span lang={other}>
                {other === "fr" ? t("common.french") : t("common.english")}
              </span>
              <CaretRightIcon className="size-4" />
            </span>
          }
        >
          {locale === "fr" ? t("common.french") : t("common.english")}
        </Row>
        <div className="flex h-11 items-center gap-3 px-2 font-semibold [&>svg]:size-5 [&>svg]:shrink-0">
          <MoonIcon />
          <span className="flex-1">{t("theme.darkMode")}</span>
          <ThemeSwitcher />
        </div>
      </Group>

      <Group title={t("more.account")}>
        {signedIn ? (
          <>
            <Row icon={<UserIcon />} href="/profile">
              {t("auth.myProfile")}
            </Row>
            <Row icon={<ChatBubbleIcon />} href="/my-suggestions">
              {t("suggestions.mine")}
            </Row>
            <Row icon={<FlagIcon />} href="/page-request">
              {t("nav.requestPage")}
            </Row>
            <Row icon={<BellIcon />} href="/settings/notifications">
              {t("more.notifications")}
            </Row>
            <Row icon={<DeviceMobileIcon />} href="/settings/devices">
              {t("more.devices")}
            </Row>
            {isAdmin && (
              <Row icon={<ShieldIcon />} href="/admin">
                {t("nav.admin")}
              </Row>
            )}
          </>
        ) : (
          <>
            <Row icon={<SignInIcon />} href="/login">
              {t("nav.login")}
            </Row>
            <Row icon={<UserPlusIcon />} href="/register">
              {t("nav.register")}
            </Row>
          </>
        )}
      </Group>

      {signedIn && (
        <Group title={t("more.other")}>
          <Row
            icon={<SignOutIcon />}
            onClick={() => startTransition(() => logout())}
          >
            {t("nav.logout")}
          </Row>
        </Group>
      )}
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-4 grid gap-0.5 border-b py-3 last:border-b-0">
      <h3 className="px-2 pb-2 text-sm text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  icon,
  href,
  onClick,
  trailing,
  children,
}: {
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const className =
    "flex h-11 w-full items-center gap-3 rounded-lg px-2 text-left font-semibold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:size-5 [&>svg]:shrink-0";
  const content = (
    <>
      {icon}
      <span className="flex-1">{children}</span>
      {trailing}
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
