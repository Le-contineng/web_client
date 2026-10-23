import type { MetadataRoute } from "next";

/**
 * Manifeste de l'application installable (PWA) : nom, icônes et affichage
 * une fois ajoutée à l'écran d'accueil. Servi à /manifest.webmanifest ; Next.js
 * ajoute la balise <link rel="manifest"> à toutes les pages.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Le Contineng",
    short_name: "Contineng",
    description: "Le réseau social des événements.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Écran de lancement (splash) : fond encre et icône du logo, sans script.
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["social", "events"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Raccourcis proposés par un appui long sur l'icône (Android, Windows)
    shortcuts: [
      {
        name: "Créer un événement",
        short_name: "Créer",
        url: "/events/new",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Rechercher",
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
