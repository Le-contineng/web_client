# 0004 — Stratégie de cache

Statut : Acceptée
Date : 2026-10-10

## Contexte
Next.js 16 propose un nouveau modèle de cache, les Cache Components (directive `"use cache"`), à côté des anciens réglages (`revalidate`, `fetch` avec options de cache).
Mélanger les deux modèles rend le comportement difficile à prévoir.

## Décision
Activer `cacheComponents` dans `next.config.ts` dès le départ et n'utiliser que ce modèle : une donnée est mise en cache uniquement si une fonction ou un composant porte explicitement `"use cache"`.

## Alternatives
- Ancien modèle (`revalidate`, options de `fetch`) : plus documenté en ligne, mais en voie de remplacement.

## Conséquences
- Par défaut, rien n'est mis en cache : on choisit consciemment ce qui l'est.
- Les données propres à un utilisateur ne doivent jamais être placées dans un cache partagé.
- Certains tutoriels en ligne ne s'appliqueront pas tels quels.
