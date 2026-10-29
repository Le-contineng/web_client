# Architecture du client web

Frontend Next.js (App Router) qui consomme l'API Spring de Le Contineng. Aucune donnée métier n'est stockée ici. Décision : [ADR 0016](adr/0016-modules-en-couches-et-espaces.md).

## Vue d'ensemble

```
src/
├── app/                         Routage uniquement
│   ├── (auth)/                      /login, /register, /forgot-password, /reset-password, /verify-email,
│   │                                /auth/google et /auth/google/callback (connexion Google)
│   ├── (user)/                      Espace utilisateur : /, /search, /e/{id}, /e/{id}/edit,
│   │                                /events/new, /p/{slug}, /my-pages…, /page-request, /profile
│   ├── @auth/                       Mêmes écrans en modal (plein écran sur mobile) quand ils sont
│   │                                ouverts depuis l'application : routes interceptées (.)login…
│   ├── @modal/                      Création d'un événement en modal sur ordinateur ((.)events/new)
│   ├── (super-admin)/admin/         Espace Super-Admin : /admin, /admin/page-requests,
│   │                                /admin/accounts, /admin/pages, /admin/events
│   ├── demo/[name]/route.ts         Images de démonstration
│   └── layout.tsx, providers.tsx, error.tsx, not-found.tsx, globals.css
├── spaces/                      Composants propres à un espace
│   ├── auth/                        Écrans d'authentification (LoginView…), en page ou en modal
│   ├── user/                        UserLayout, Sidebar, MobileHeader, BottomNav, navigation…
│   └── super-admin/                 AdminShell, AdminTabs, Pagination, AdminSearch, EmptyState…
├── modules/                     Métier, un module par fonctionnalité
│   ├── authentication/              Connexion, inscription, sessions, adresse, mot de passe (ADR 0018)
│   ├── profiles/                    Profil (nom, photo, langue), recherche de personnes
│   ├── events/                      Événements : fil, fiche, filtres, publication
│   ├── pages/                       Pages, demandes de page, « Mes pages », accès
│   ├── audience/                    Vues uniques par jour
│   ├── notifications/               Cloche et notifications
│   ├── metrics/                     Métriques produit
│   ├── medias/                      Photos : compression et envoi direct au stockage (ADR 0014 du backend)
│   └── admin/                       Supervision (réservé au Super-Admin)
├── proxy.ts                     Renouvelle la session avant le rendu (ADR 0018)
└── shared/                      Transverse, sans métier
    ├── ui/                          Composants shadcn/ui (non modifiés)
    ├── components/                  Composants génériques : Logo, PageTitle, FormField, ProfileAvatar…
    │                                et icons.tsx, seule porte vers les icônes (Phosphor)
    ├── api/                         Client HTTP, cookies de session, erreurs
    ├── config/                      Variables d'environnement validées (env, clientEnv)
    ├── i18n/                        Catalogues FR/EN, dates, langue
    ├── hooks/                       Hooks transverses
    └── lib/                         Utilitaires purs
```

| Dossier    | Contient                                        | Ne contient pas                      |
| ---------- | ----------------------------------------------- | ------------------------------------ |
| `app/`     | `page.tsx`, `layout.tsx`, métadonnées, routes   | Logique, composants réutilisables    |
| `spaces/`  | Coques, navigation, composants d'un seul espace | Appels API, règles métier            |
| `modules/` | Tout ce qui concerne une fonctionnalité         | Code d'un autre module, routage      |
| `shared/`  | Ce qui ne connaît aucun module                  | Tout ce qui parle d'événement, page… |

## Structure d'un module

```
modules/events/
├── domain/                  Types et règles en TypeScript pur, testés (event.ts, search.ts…)
├── application/             Server Actions : Zod + droits + appel à l'infrastructure
├── infrastructure/          Appels à l'API et adaptation de son contrat (events.api.ts…)
├── presentation/components/ Composants React du module (EventCard, EventForm…)
├── index.ts                 API publique utilisable partout (composants, types, règles)
└── server.ts                API publique côté serveur (lectures, cache), protégée par server-only
```

Une couche n'est créée que si elle sert : `metrics` n'a que `infrastructure/` et `server.ts`, `admin` n'a pas de `presentation/`. Les sous-dossiers `entities/`, `use-cases/`, `mappers/`… s'ajoutent le jour où un module en a réellement besoin.

## Règles de dépendance

Vérifiées par `npm run arch` (`.dependency-cruiser.cjs`) :

1. Pas de dépendance circulaire.
2. `app/` utilise un module par `index.ts`, `server.ts` ou `application/`, et un espace par son `index.ts`.
3. `spaces/` utilise un module de la même façon ; les deux espaces ne s'importent pas et ne connaissent pas `app/`.
4. Un module n'utilise un autre module que par `index.ts` ou `server.ts`, et ne connaît ni `app/` ni `spaces/`.
5. Dans un module : `domain/` ne dépend que de `domain/` ; `infrastructure/` ne dépend ni d'`application/` ni de `presentation/` ; `application/` ne dépend pas de `presentation/` ; `presentation/` ne parle pas à `infrastructure/`.
6. `shared/` ne dépend d'aucun module, espace ni route ; `shared/ui` ne dépend pas de `shared/components`.
7. Le module `admin` n'est utilisé que par `(super-admin)` et `spaces/super-admin` ; `(user)`, `(auth)` et `spaces/user` n'importent rien du Super-Admin.

En plus, `import "server-only"` dans `server.ts` et les appels à l'API de `infrastructure/` fait échouer le build si un composant client les importe.

## Super-Admin et utilisateur

Les deux espaces ont leurs routes (`(super-admin)/admin`, `(user)`), leur coque (`AdminShell`, `UserLayout`) et leurs composants (`spaces/<espace>/`). Ils consomment les **mêmes modules** : par exemple, `events` sert le fil utilisateur et la liste d'administration. Le métier n'est jamais dupliqué.

Masquer une route ou un bouton n'est pas une protection : l'accès admin est vérifié côté serveur (`getCurrentAdmin`, et l'API contrôle le rôle à chaque appel), et chaque Server Action vérifie les droits.

## Où mettre un nouveau composant ?

1. Primitive d'interface (bouton, dialogue…) → `npx shadcn@latest add <nom>`, dans `shared/ui/`. Ne pas y mettre de métier.
2. Générique, sans notion métier (logo, champ de formulaire) → `shared/components/`.
3. Lié à une fonctionnalité (carte d'événement, formulaire de page) → `modules/<module>/presentation/components/`, exporté par `index.ts` si d'autres l'utilisent.
4. Propre à un espace (onglets d'admin, barre de navigation mobile) → `spaces/<espace>/components/`, exporté par `spaces/<espace>/index.ts`.

N'ajouter `"use client"` que si le composant utilise un état, un effet ou un événement du navigateur.

## Ajouter une fonctionnalité

1. Créer `src/modules/<module>/` avec les seules couches utiles.
2. Règles et types purs dans `domain/`, avec leurs tests (`*.test.ts`).
3. Appels à l'API dans `infrastructure/<module>.api.ts` (via `@/shared/api/client`), qui traduit la réponse en types de `domain/`.
4. Lectures exposées par `server.ts` ; écritures par une Server Action dans `application/` (validation Zod + vérification des droits).
5. Composants dans `presentation/components/`, exportés par `index.ts` (n'exporter que ce qui sert ailleurs).
6. Page dans `app/(user)/…` ou `app/(super-admin)/admin/…`, qui ne fait que composer.
7. `npm run check`.

## Conventions

- Imports absolus `@/…` (vers `src/`) ; le relatif n'est utilisé qu'à l'intérieur d'un même dossier.
- Composants en PascalCase (`EventCard.tsx`), hooks `useXxx.ts`, suffixes `*.api.ts`, `*.types.ts`, `*.actions.ts`. Les fichiers shadcn gardent leur nom d'origine (`button.tsx`).
- Jamais `process.env` directement : `env` (serveur) ou `clientEnv` (client) depuis `@/shared/config/`.
- Noms de code en anglais (ADR 0015) ; textes affichés dans `shared/i18n/messages/`.
