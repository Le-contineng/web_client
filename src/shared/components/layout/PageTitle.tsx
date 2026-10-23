import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

export function PageTitle({
  title,
  returnTo,
  subtitle,
}: {
  title: string;
  returnTo?: string;
  subtitle?: string;
}) {
  const t = useTranslations("common");
  return (
    <div className="mb-4 flex items-center gap-3">
      {returnTo && (
        <Link
          href={returnTo}
          aria-label={t("back")}
          className={cn(
            buttonVariants({ variant: "glass", size: "circle" }),
            "shrink-0",
          )}
        >
          <ArrowLeftIcon />
        </Link>
      )}
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
