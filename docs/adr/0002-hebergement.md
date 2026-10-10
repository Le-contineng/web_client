# 0002 — Hébergement

Statut : Acceptée
Date : 2026-10-10

## Contexte
Le frontend peut être déployé sur un VPS privé ou sur un hébergeur gratuit.
Le déployer sur un VPS privé demanderait d'abord de le conteneuriser (Docker).
Le rendu hybride (ADR 0001) exige un hébergeur qui exécute Node.

## Décision
Pour démarrer, le projet est déployé gratuitement sur Vercel, avec un déploiement de prévisualisation par pull request.

## Alternatives
- Un autre hébergeur comme Netlify : possible, mais Vercel est fait par les créateurs de Next.js et prend en charge ses nouveautés en premier.
- Un VPS privé avec Docker : contrôle total, mais il faut gérer soi-même le serveur, les mises à jour, le HTTPS et les déploiements.

## Conséquences
- Chaque PR obtient une URL de prévisualisation, utile pour relire avant de fusionner.
- Les secrets sont stockés dans les réglages Vercel, pas dans le dépôt.
- Le plan gratuit a des limites ; si on les dépasse ou si une contrainte légale impose d'héberger nous-mêmes, on passera au VPS avec Docker via un nouvel ADR.
