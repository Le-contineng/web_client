import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { clientEnv } from "@/shared/config/env.client";
import { WebVitals } from "@/shared/components/WebVitals";
import { THEME_SCRIPT } from "@/shared/lib/theme";
import { env } from "@/shared/config/env";
import { PUBLIC_IMAGE_HOST } from "@/modules/events";
import { Providers } from "./providers";
import "./globals.css";

/**
 * Police de toute l'interface (titres et texte) : Space Grotesk, seule famille
 * de la charte graphique (SIL OFL), variable de 300 à 700 (la charte n'en va
 * jamais au-delà). Next.js l'héberge avec le site et ajuste une police de
 * repli du système à ses mesures, pour éviter tout décalage au chargement.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Le Contineng",
    template: "%s · Le Contineng",
  },
  description: "Le réseau social des événements.",
  applicationName: "Le Contineng",
  // Application ajoutée à l'écran d'accueil d'un iPhone : plein écran, nom court
  appleWebApp: {
    capable: true,
    title: "Le Contineng",
    statusBarStyle: "default",
  },
};

/** Couleur de la barre du navigateur et de l'application installée, selon le thème. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/** Document racine : polices, mesures Web Vitals et providers globaux. */
export default function RootLayout({
  children,
  auth,
  modal,
}: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      // La classe `dark` est posée par le script du thème avant React.
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        {/* Thème appliqué avant le premier affichage (pas de flash clair). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Connexion ouverte d'avance vers les serveurs d'images : la première photo arrive plus tôt */}
        {[...storageOrigins(), PUBLIC_IMAGE_HOST].map((origin) => (
          <link key={origin} rel="preconnect" href={origin} />
        ))}
      </head>
      <body className="flex min-h-full flex-col">
        {/* Mesures affichées en développement seulement : rien à envoyer au navigateur en prod */}
        {env.NODE_ENV === "development" && <WebVitals />}
        <Providers>
          {children}
          {/* Connexion, inscription… en modal (routes interceptées de @auth) */}
          {auth}
          {/* Création d'un événement en modal sur ordinateur (routes interceptées de @modal) */}
          {modal}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

/** Origines du stockage des photos (préconnexion), lues dans la configuration. */
function storageOrigins(): string[] {
  return env.MEDIAS_STORAGE_ORIGINS.split(/[\s,]+/).filter(Boolean);
}
