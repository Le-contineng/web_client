/**
 * Écrans principaux : les onglets de la barre du bas. Elle n'est visible que
 * sur eux ; les autres pages (réglages, page d'organisation…) ont leur propre
 * bouton retour.
 */
const MAIN_TABS = ["/", "/search", "/my-pages", "/profile"];

export function isMainTab(pathname: string): boolean {
  return MAIN_TABS.includes(pathname);
}
