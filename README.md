# Le Contineng — client web

Le réseau social centré sur les événements. Ce dépôt contient le site web, construit avec Next.js 16 (App Router), React 19, TypeScript et Tailwind CSS v4.

Production : https://le-contineng.vercel.app

## Démarrer en moins de 10 minutes

**Prérequis :** Node.js 24 (le fichier `.nvmrc` le précise) et git.

```bash
git clone git@github.com:Le-contineng/web_client.git
cd web_client
nvm use                       # passe à Node 24 si tu utilises nvm
npm ci                        # installe les dépendances exactes du lockfile
cp .env.example .env.local    # puis adapte les valeurs si besoin
npm run dev                   # http://localhost:3000
```

`npm ci` échoue volontairement si la version de Node n'est pas la 24 (`engine-strict` dans `.npmrc`).

## Commandes

| Commande                | Rôle                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm run dev`           | Serveur de développement, recompile à chaque sauvegarde                  |
| `npm run build`         | Build de production (le même que Vercel)                                 |
| `npm run start`         | Sert le build de production                                              |
| `npm run check`         | **À lancer avant de pousser** : format, lint, types, architecture, tests |
| `npm run format`        | Formate tout le projet avec Prettier                                     |
| `npm run lint`          | ESLint                                                                   |
| `npm run typecheck`     | Vérifie les types TypeScript                                             |
| `npm run arch`          | Vérifie les règles d'architecture (dependency-cruiser)                   |
| `npm run test`          | Tests unitaires et de composants (Vitest)                                |
| `npm run test:coverage` | Tests unitaires avec seuil de couverture                                 |
| `npm run test:e2e`      | Tests de bout en bout et d'accessibilité (Playwright + axe)              |

Avant le premier `npm run test:e2e`, installe le navigateur de test : `npx playwright install chromium`.

Les hooks Git (Husky) tournent tout seuls : avant chaque commit, `lint-staged` formate et corrige les fichiers modifiés ; avant chaque push, `typecheck` et `arch` sont lancés.

## Variables d'environnement

Elles sont décrites et validées par Zod dans `src/shared/config/schema.ts`. Une variable manquante fait échouer le build en la nommant.

| Variable                 | Côté    | Obligatoire | Rôle                                                                                |
| ------------------------ | ------- | ----------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | public  | oui         | Adresse publique du site                                                            |
| `API_URL`                | serveur | non         | URL de l'API (défaut :8080)                                                         |
| `FUSEAU_APERCU`          | serveur | non         | Fuseau de l'aperçu WhatsApp                                                         |
| `NEXT_PUBLIC_FIREBASE_*` | public  | non         | Projet Firebase des notifications push (ADR 0017) ; push désactivés si l'une manque |

- En local : `.env.local` (jamais commité).
- En CI : bloc `env` de `.github/workflows/ci.yml`.
- Sur Vercel : _Settings > Environment Variables_.

Les variables `NEXT_PUBLIC_*` sont recopiées dans le code au moment du build : pas de secret dedans, et changer leur valeur demande un nouveau build. Dans le code, on n'utilise jamais `process.env` directement : on importe `env` (serveur, `@/shared/config/env`) ou `clientEnv` (`@/shared/config/env.client`).

## Architecture

Détails et règles : **[docs/architecture.md](docs/architecture.md)** ([ADR 0016](docs/adr/0016-modules-en-couches-et-espaces.md), noms en anglais : [ADR 0015](docs/adr/0015-nommage-en-anglais.md)). Deux espaces partagent le même code métier : l'espace **utilisateurs** (visiteurs et membres) et le **Super-Admin**.

```
src/
├── app/            Routage Next.js uniquement : (auth), (user), (super-admin)/admin
├── spaces/         Coques et composants propres à un espace : user/, super-admin/
├── modules/        Métier, un module par fonctionnalité : domain/, application/,
│                   infrastructure/, presentation/, index.ts, server.ts
└── shared/         Transverse, sans métier : ui/ (shadcn), components/, api/, config/, i18n/, hooks/, lib/
```

Les règles de dépendance sont vérifiées par `npm run arch` (dependency-cruiser). Les anciennes adresses françaises (`/connexion`, `/mes-pages`, `/admin/demandes`…) redirigent vers les nouvelles (`next.config.ts`).

### Démonstration

Les données de démo sont chargées par l'API lancée avec le profil `local` (`./mvnw spring-boot:run -Dspring-boot.run.profiles=local`). Mot de passe commun : `demo1234`.

| E-mail                 | Rôle                                            |
| ---------------------- | ----------------------------------------------- |
| `awa@contineng.test`   | Propriétaire de BDE et Les Planches             |
| `karim@contineng.test` | Propriétaire de Club Foot, contributeur BDE     |
| `lina@contineng.test`  | Utilisatrice sans page (une demande en attente) |
| `admin@contineng.test` | Admin (`/admin`)                                |

En plus, importer un `server.ts` depuis un composant `"use client"` fait échouer `next build`, grâce à `import "server-only"`.

### Ajouter un composant shadcn/ui

```bash
npx shadcn@latest add dialog
```

`components.json` écrit les composants dans `src/shared/ui`. On ne les modifie pas pour y mettre du métier : un composant métier (comme `EventCard`) vit dans `src/modules/<module>/presentation/components` et **assemble** les composants de `shared/ui`.

### Cache

`cacheComponents` est activé (ADR 0004) : rien n'est mis en cache par défaut. Une fonction ou un composant n'est mis en cache que s'il porte `"use cache"`, dans `src/modules/<module>/server.ts` ou l'infrastructure du module. Les données propres à un utilisateur ne vont jamais dans un cache partagé.

Sont mis en cache, avec le profil `publicList` (30 s, servi au plus 2 min pendant le renouvellement, défini dans `next.config.ts`) : la liste des pages (`getAllPages`), les campagnes en cours et le fil des visiteurs sans compte. Le fil d'une personne connectée n'est jamais mis en cache : il dit ce qu'elle a fait (`viewer`).

### Sécurité

Voir l'ADR 0008. En résumé : en-têtes de sécurité sur toutes les pages, CSP en mode Report-Only, aucune image externe autorisée, et **toute Server Action est un endpoint public** qui valide ses entrées avec Zod et vérifie les droits.

## Tests

- **Unitaires et composants** (Vitest + Testing Library) : à côté du code, en `*.test.ts(x)`. Le seuil de couverture (80 %) ne s'applique qu'à `domain/` et `application/`.
- **Bout en bout** (Playwright) : dans `e2e/`. Ils vérifient la page d'accueil, l'absence de violation d'accessibilité WCAG A/AA (axe), les en-têtes de sécurité et la page 404.
  Ils ne dépendent ni de la base ni de l'API Spring : Playwright démarre d'abord une **API factice** (`e2e/api-factice/serveur.mjs`, port 8089, sans dépendance) qui reproduit le contrat HTTP pour un visiteur sans compte avec les données de démonstration, puis lance Next avec `API_URL` pointant dessus. Si un test E2E a besoin d'une nouvelle route, on l'ajoute à ce serveur en respectant le contrat de l'API.

## Git et déploiement

- On ne travaille jamais directement sur `main` : `git switch main`, `git pull`, puis `git switch -c <sujet>`.
- Préfixes de commit : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`.
- Chaque pull request lance la CI (3 jobs parallèles : qualité, unitaires, e2e) et une preview Vercel.
- Fusionner dans `main` déploie en production sur Vercel.
- Dependabot propose chaque semaine les mises à jour de npm et des GitHub Actions.

## Décisions

Les décisions d'architecture sont dans [`docs/adr/`](docs/adr). Chacune a un statut (Acceptée ou Reportée) et, si elle est reportée, le moment où y revenir.

### Reporté après le Sprint 0

| Sujet                                 | À reprendre quand                                           |
| ------------------------------------- | ----------------------------------------------------------- |
| Thème sombre (ADR 0006)               | Les utilisateurs le demandent                               |
| Authentification (ADR 0007)           | Une fonctionnalité doit savoir qui est l'utilisateur        |
| CSP bloquante à nonce (ADR 0008)      | Authentification, contenu tiers ou données sensibles        |
| Envoi des Web Vitals en production    | Premiers utilisateurs réels                                 |
| Sentry / OpenTelemetry                | Premiers utilisateurs réels (brancher `instrumentation.ts`) |
| MSW pour simuler l'API dans les tests | L'API existe                                                |
| Storybook ou catalogue de composants  | Plus de 15 composants partagés ou un second contributeur    |
| Gestion d'état global, TanStack Query | Un vrai besoin d'état client partagé entre routes           |
| TypeScript 7                          | Next.js et l'outillage le prennent officiellement en charge |
