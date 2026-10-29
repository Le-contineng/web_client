import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import {
  clientSchema,
  serverSchema,
  validate,
} from "./src/shared/config/schema";

const serverEnv = validate(serverSchema, process.env);
const clientEnv = validate(clientSchema, process.env);

// Stockage des photos : le navigateur y envoie les photos (connect-src) et y
// lit les images vers lesquelles l'API redirige (img-src), ADR 0014 du backend.
// Stockage public des photos (R2), lu directement par le navigateur.
const mediaOrigin = clientEnv.NEXT_PUBLIC_MEDIA_URL
  ? new URL(clientEnv.NEXT_PUBLIC_MEDIA_URL).origin
  : "";

const storageOrigins = serverEnv.MEDIAS_STORAGE_ORIGINS.split(/[\s,]+/)
  .filter(Boolean)
  .join(" ");

// Mode « observation » : le navigateur signale les violations sans rien bloquer.
// Une CSP stricte à nonce rendrait toutes les pages dynamiques (voir ADR 0008).
const contentSecurityPolicy = [
  "default-src 'self'",
  // SDK Firebase chargé par le service worker des notifications push (ADR 0017)
  "script-src 'self' 'unsafe-inline' https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com ${mediaOrigin} ${storageOrigins}`.trim(),
  "font-src 'self'",
  // Firebase Installations et Cloud Messaging : enregistrement des push (ADR 0017)
  `connect-src 'self' https://*.googleapis.com ${storageOrigins}`.trim(),
  "object-src 'none'",
  // Manifeste de l'application installable (PWA), servi par le site
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const enTetesDeSecurite = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Listes publiques (fil, pages, campagnes), les mêmes pour tous les
  // visiteurs : gardées 30 s, servies au plus 2 min pendant leur
  // renouvellement (ADR 0004). Moins de 5 min : jamais figées au build.
  cacheLife: {
    publicList: { stale: 30, revalidate: 30, expire: 120 },
  },
  poweredByHeader: false,
  // Le sélecteur de profil occupe le coin bas gauche (US-37).
  devIndicators: { position: "bottom-right" },
  experimental: {
    // Photos d'événement jusqu'à 5 Mo (US-11), envoyées par Server Action.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    // Aucun domaine externe autorisé tant qu'on n'en a pas besoin.
    remotePatterns: [],
  },
  // Sans NEXT_PUBLIC_MEDIA_URL, les photos passent par le site vers l'API
  // (chaque image compte alors comme une requête Vercel).
  async rewrites() {
    return [
      {
        source: "/api/v1/medias/:id",
        destination: `${process.env.API_URL ?? "http://localhost:8080"}/api/v1/medias/:id`,
      },
    ];
  },
  // Anciennes adresses françaises (liens déjà partagés, notifications
  // enregistrées) : redirigées vers les adresses actuelles (ADR 0014).
  async redirects() {
    const anciennes: [string, string][] = [
      ["/connexion", "/login"],
      ["/inscription", "/register"],
      ["/recherche", "/search"],
      ["/evenements/nouveau", "/events/new"],
      ["/e/:id/modifier", "/e/:id/edit"],
      ["/mes-pages", "/my-pages"],
      ["/mes-pages/:slug", "/my-pages/:slug"],
      ["/mes-pages/:slug/acces", "/my-pages/:slug/access"],
      ["/mes-evenements", "/my-pages"],
      ["/acces", "/my-pages"],
      ["/demande-page", "/page-request"],
      ["/profil", "/profile"],
      ["/admin/demandes", "/admin/page-requests"],
      ["/admin/demandes/:id", "/admin/page-requests/:id"],
      ["/admin/comptes", "/admin/accounts"],
      ["/admin/evenements", "/admin/events"],
    ];
    return anciennes.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: enTetesDeSecurite }];
  },
};

// Interface FR/EN sans préfixe d'URL (ADR 0009).
export default createNextIntlPlugin("./src/shared/i18n/request.ts")(nextConfig);
