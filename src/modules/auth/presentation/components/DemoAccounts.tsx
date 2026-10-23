import { useTranslations } from "next-intl";

const ACCOUNTS = [
  ["awa@contineng.test", "BDE, Les Planches"],
  ["karim@contineng.test", "Club Foot, BDE"],
  ["lina@contineng.test", "—"],
  ["admin@contineng.test", "Admin"],
] as const;

/** Aide de démonstration : identifiants des comptes simulés (ADR 0010). */
export function DemoAccounts() {
  const t = useTranslations("auth");
  return (
    <div className="rounded-2xl border border-dashed border-foreground/20 bg-foreground/5 p-3 text-xs text-muted-foreground">
      <p className="mb-2 font-medium">{t("demoAccounts")}</p>
      <ul className="grid gap-1">
        {ACCOUNTS.map(([email, role]) => (
          <li key={email} className="flex justify-between gap-2">
            <code>{email}</code>
            <span>{role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
