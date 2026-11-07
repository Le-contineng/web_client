import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { MemberPage } from "@/modules/pages";
import { ArrowLeftIcon } from "@/shared/components/icons";

/**
 * En-tête d'une tâche de l'espace organisateur (publier, modifier, poster) :
 * le rappel de la page et de la rubrique d'où l'on vient, cliquable pour y
 * revenir, puis le titre de la tâche et, s'il y a lieu, l'événement concerné.
 */
export async function StudioTaskHeader({
  page,
  back,
  title,
  subject,
}: {
  page: MemberPage;
  /** Rubrique d'où l'on vient, et son adresse. */
  back: { label: string; href: string };
  title: string;
  /** L'événement concerné, quand la tâche porte sur l'un d'eux. */
  subject?: string;
}) {
  const t = await getTranslations("studio");
  return (
    <header className="grid gap-3 border-b bg-card px-4 pt-4 pb-5 sm:px-6 md:pt-5">
      <Link
        href={back.href}
        // Sur téléphone, la barre de retour de la tâche porte déjà ce lien
        className="-ml-1 hidden w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:flex"
      >
        <ArrowLeftIcon className="size-4" />
        {t("taskBack", { page: page.name, section: back.label })}
      </Link>
      <div className="grid gap-0.5">
        <h1 className="text-xl leading-tight font-semibold tracking-tight">
          {title}
        </h1>
        {subject && (
          <p className="truncate text-sm text-muted-foreground">{subject}</p>
        )}
      </div>
    </header>
  );
}
