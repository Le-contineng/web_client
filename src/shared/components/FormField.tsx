import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";

/** Champ de saisie du relooking : 50 px, rayon 14, fond « champ » (à passer à <Input>). */
export const FIELD_CLASS =
  "h-[50px] rounded-field border-transparent bg-muted px-4 text-base md:text-base dark:bg-muted focus-visible:border-ring focus-visible:bg-card";

/** Libellé + contrôle + aide + erreur affichée sous le champ (US-11). */
export function FormField({
  id,
  label,
  error,
  help,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  error?: string | null;
  help?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help && !error && (
        <p className="text-xs text-muted-foreground">{help}</p>
      )}
      {error && (
        <p
          id={`${id}-erreur`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
