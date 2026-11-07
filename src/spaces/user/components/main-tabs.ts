/**
 * Écrans principaux : les onglets de la barre du bas. Elle n'est visible que
 * sur eux ; les autres pages (réglages, page d'organisation…) ont leur propre
 * bouton retour.
 */
const MAIN_TABS = ["/", "/search", "/my-pages", "/profile"];

/**
 * Rubriques de l'espace organisateur : le prolongement de « Mes pages »
 * (directement pour qui n'a qu'une page). Ses tâches (publier, modifier,
 * poster) restent des écrans secondaires.
 */
const STUDIO_SECTION = /^\/studio\/[^/]+(\/(audience|equipe|profil))?$/;

export function isStudioSection(pathname: string): boolean {
  return STUDIO_SECTION.test(pathname);
}

export function isMainTab(pathname: string): boolean {
  return MAIN_TABS.includes(pathname) || isStudioSection(pathname);
}
