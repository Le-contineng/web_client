# 0020 — Statistiques d'abonnés d'une page

Statut : Acceptée
Date : 2026-10-30
Complète : ADR 0019 (suivre une page), ADR 0024 du backend (branche `feat/statistiques-abonnes`)

## Contexte

L'API expose `GET /api/v1/pages/{pageId}/abonnes/statistiques?jours=N` (1 à 365, 30 par défaut), réservé aux membres de la page (`accesRefuse` sinon). La réponse donne le total actuel, les abonnements (`gagnes`) et désabonnements (`perdus`) de la période, et chaque jour (`jour`, `gagnes`, `perdus`, `total`), du plus ancien au plus récent. Les mouvements sont enregistrés sans l'identité des personnes.

Côté API, la route vit dans le module « audience » (`ControleurAudience`), avec les vues des événements. Côté site, deux modules pouvaient l'accueillir :

- `audience` : la mesure de la consultation anonyme (vues des fiches, visites, cookie visiteur) ;
- `pages` : la page et ses relations (membres, abonnés : `setFollowAction`, `FollowButton`, `viewer.following`, nombre d'abonnés, « Pages suivies »).

## Décision

- **Module `pages`**, pas `audience`. Les abonnés sont une relation entre des comptes et une page, déjà tenue par `pages` (ADR 0019). Le site ne reproduit pas le découpage du backend : la couche d'infrastructure traduit la route.
- **Frontière des deux modules** : `audience` = consultations anonymes (vues, visites, installations) ; `pages` = la page et ses relations, statistiques comprises. Une nouvelle statistique se range selon son sujet, pas parce qu'elle produit des chiffres.
- **Couches** :
  - `domain/follower-stats.ts` : types `FollowerStats` (`total`, `gained`, `lost`, `days`) et `FollowerStatsDay` (`date`, `gained`, `lost`, `total`) ; périodes proposées `7 | 30 | 90 | 365`, lues depuis l'adresse avec Zod (valeur inconnue → 30).
  - `infrastructure/follower-stats.api.ts` : `fetchFollowerStats(pageId, days)`, qui valide la réponse avec Zod et traduit `gagnes`/`perdus`/`jour` ; `accesRefuse` devient `accessDenied` (déjà traduit par `shared/api/client`).
  - `server.ts` : `getFollowerStats(pageId, days)`.
  - `presentation/components/FollowerStatsView.tsx` : trois chiffres (total, « +gagnés », « −perdus »), la courbe du total et un tableau équivalent pour les lecteurs d'écran ; état vide sans aucun mouvement.
- **Pas de Server Action** : c'est une lecture. La période est un paramètre d'adresse (`?days=30`), des liens la changent ; la page est partageable entre membres et fonctionne sans JavaScript.
- **Écran** : onglet « Abonnés » dans `MyPageTabs`, route `src/app/(user)/my-pages/[slug]/(profile)/followers/page.tsx`. Visible par tous les membres de la page (même règle que l'API). Le layout vérifie déjà la session et l'appartenance.
- **Cache** : rendu à chaque requête, jamais de cache partagé (ADR 0004) ; données propres aux membres. `/my-pages` est déjà interdite dans `robots.txt`.
- **Graphique** : SVG écrit à la main (une seule courbe, au plus 365 points), sans bibliothèque de graphiques ni JavaScript côté client.

## Alternatives

| Option                                          | Pour                                                        | Contre                                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **A. Module `pages`** (retenue)                 | Un seul module connaît les abonnés ; cohérent avec ADR 0019 | Diffère du découpage de l'API                                                                        |
| B. Module `audience`                            | Suit l'API ; traduction des routes françaises déjà en place | `audience` deviendrait « tout ce qui produit des chiffres » ; deux modules connaîtraient les abonnés |
| C. Nouveau module `followers` (ou `statistics`) | Isolement maximal                                           | Coupe la relation « suivre » en deux (bouton dans `pages`, chiffres ailleurs) pour un seul écran     |

Pour le graphique :

| Option                                 | Pour                                                                                | Contre                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **SVG à la main** (retenue)            | Rendu serveur, aucun poids ajouté, cohérent avec les efforts de performance récents | Infobulles et axes à écrire soi-même                        |
| Recharts / composant `chart` de shadcn | Interactions prêtes                                                                 | Composant client et dépendance lourde pour une seule courbe |

Pour la période : un champ libre (1 à 365) a été écarté au profit de quatre choix, plus simples sur mobile.

## Conséquences

- `audience` reste centré sur la mesure anonyme ; `pages` grossit d'une lecture et d'un composant.
- Si d'autres statistiques de page arrivent (abonnés par événement, provenance), elles iront dans `pages` ; au-delà de quelques écrans, un sous-dossier `presentation/components/stats/` suffira avant de créer un module.
- La mise en ligne dépend de la fusion de `feat/statistiques-abonnes` côté API, qui touche aussi aux notifications (migration V30) ; le bloc « suivre une page » (ADR 0019) doit passer en production avant ou en même temps.
- Si l'API ne répond pas (route absente en production, erreur), l'onglet affiche « statistiques indisponibles » au lieu d'une erreur.
- L'historique commence à la mise en service côté API : avant, aucun mouvement n'existe et la courbe est plate. L'état vide le dit.
- **Quand sortir un module `followers`** (bouton, « Pages suivies » et statistiques ensemble, jamais les statistiques seules) : `pages` dépasse environ 2 500 lignes ou 25 fichiers, les abonnements gagnent leurs propres réglages (notifications par page, recommandations), ou un autre module doit les lire autrement que par `server.ts`.

## Étapes

1. Domaine : types, périodes, schéma Zod de la réponse, tests.
2. Infrastructure : `followerStats` et traduction de `accesRefuse`.
3. `server.ts`, composant `FollowerStats`, export par `index.ts`.
4. Onglet « Abonnés » et route `followers/page.tsx` ; libellés français et anglais (ADR 0009).
5. `npm run check`, essai contre l'API locale sur `feat/statistiques-abonnes`.
