import type { ReactNode } from "react";
import { FIELD_CLASS } from "@/shared/components/FormField";
import { Logo } from "@/shared/components/layout/Logo";
import { cn } from "@/shared/lib/utils";

/** Champs en capsules sombres, sur le verre fumé de la connexion. */
export const AUTH_FIELD_CLASS = cn(
  FIELD_CLASS,
  "rounded-full bg-white/10 dark:bg-white/10",
);

/** Verre fumé, plus opaque que les barres : du texte y est posé sur des formes vives. */
const SMOKED_GLASS =
  "ct-glass ct-glass--scrim rounded-[28px] [--muted-foreground:#b9c0ca]";

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-sm gap-3 px-4 py-8">
      <div className={`grid gap-6 p-7 ${SMOKED_GLASS}`}>
        <div className="grid justify-items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
      <p className={`p-4 text-center text-sm ${SMOKED_GLASS}`}>{footer}</p>
    </div>
  );
}
