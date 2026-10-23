"use client";

import {
  ChevronRightIcon,
  FlagIcon,
  LanguagesIcon,
  LogInIcon,
  LogOutIcon,
  MoonIcon,
  ShieldIcon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useTransition } from "react";
import { ThemeSwitcher } from "@/shared/components/ThemeSwitcher";
import { changeLocale } from "@/shared/i18n/actions";

/**
 * Contenu du menu « Plus » : réglages (langue, D2 ; thème, ADR 0006), compte
 * (profil, page, administration) et connexion ou déconnexion. Affiché en
 * popover sur ordinateur et en feuille sur téléphone.
 */
export function MoreMenuContent({
  signedIn,
  isAdmin,
  logout,
  onNavigate,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  /** Ferme le menu quand on suit un lien. */
  onNavigate?: () => void;
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
          icon={<LanguagesIcon />}
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
              <ChevronRightIcon className="size-4" />
            </span>
          }
        >
          {locale === "fr" ? t("common.french") : t("common.english")}
        </Row>
        <div className="flex min-h-11 items-center gap-3 px-2 font-semibold [&>svg]:size-5 [&>svg]:shrink-0">
          <MoonIcon />
          <span className="flex-1">{t("theme.darkMode")}</span>
          <ThemeSwitcher />
        </div>
      </Group>

      <Group title={t("more.account")}>
        {signedIn ? (
          <>
            <Row icon={<UserIcon />} href="/profile" onClick={onNavigate}>
              {t("auth.myProfile")}
            </Row>
            <Row icon={<FlagIcon />} href="/page-request" onClick={onNavigate}>
              {t("nav.requestPage")}
            </Row>
            {isAdmin && (
              <Row icon={<ShieldIcon />} href="/admin" onClick={onNavigate}>
                {t("nav.admin")}
              </Row>
            )}
          </>
        ) : (
          <>
            <Row icon={<LogInIcon />} href="/login" onClick={onNavigate}>
              {t("nav.login")}
            </Row>
            <Row icon={<UserPlusIcon />} href="/register" onClick={onNavigate}>
              {t("nav.register")}
            </Row>
          </>
        )}
      </Group>

      {signedIn && (
        <Group title={t("more.other")}>
          <Row
            icon={<LogOutIcon />}
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
    <section className="mx-3 grid gap-0.5 border-b border-foreground/10 py-3 last:border-b-0">
      <h3 className="px-2 pb-2 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
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
    "flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left font-semibold outline-none hover:bg-foreground/7 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-foreground/7 [&>svg]:size-5 [&>svg]:shrink-0";
  const content = (
    <>
      {icon}
      <span className="flex-1">{children}</span>
      {trailing}
    </>
  );
  return href ? (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
