/**
 * Kit des écrans de gestion (espace organisateur) : un seul style de champ,
 * de filtre et d'action principale, pour que chaque formulaire et chaque
 * liste parlent la même langue. Les composants shadcn/ui restent intacts ;
 * ces classes les habillent.
 */

/** Champ plein, gris, sans bordure ; anneau au focus et en erreur. */
export const FILLED_FIELD =
  "h-12 rounded-xl border-transparent bg-muted px-4 text-[15px] shadow-none dark:bg-muted focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-transparent aria-invalid:ring-2 aria-invalid:ring-destructive/50 md:text-[15px]";

/** Zone de texte pleine, même langage que le champ. */
export const FILLED_TEXTAREA =
  "min-h-28 rounded-xl border-transparent bg-muted px-4 py-3 text-[15px] shadow-none dark:bg-muted focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-transparent aria-invalid:ring-2 aria-invalid:ring-destructive/50 md:text-[15px]";

/** Filtre segmenté (périodes, états) : le choix actif est une pastille blanche. */
export const SEGMENTED =
  "flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none]";
export const SEGMENT =
  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-card aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:shadow-xs";

/**
 * Action principale d'un écran (Publier, Enregistrer) : la seule en fuchsia
 * de l'écran (la navigation active est en encre), même hauteur partout ; désactivée, elle passe en gris lisible plutôt
 * qu'en rose pâle.
 */
export const PRIMARY_ACTION =
  "h-11 w-full px-5 text-[15px] disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 sm:w-auto sm:min-w-40";
