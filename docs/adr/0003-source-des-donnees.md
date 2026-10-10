# 0003 — Source des données

Statut : Acceptée
Date : 2026-10-10

## Contexte
Le Sprint 0 ne comporte pas de backend, mais Le Contineng affichera des événements, des profils et des interactions qui viendront d'une API à construire.
Appeler une API depuis le navigateur exposerait ses adresses internes et ses éventuels secrets.

## Décision
Next.js joue le rôle de BFF (Backend for Frontend) : toute lecture ou écriture de données passe par le serveur Next.js (Server Components, Server Actions), jamais directement depuis le navigateur.

## Alternatives
- Contenu fixe dans le code : ne convient pas à un réseau social dont le contenu vient des utilisateurs.
- Appels directs du navigateur vers l'API : plus simple au début, mais expose l'API et complique la sécurité.

## Conséquences
- Le code d'accès aux données vit dans les fichiers `server.ts` des modules, protégés par `import "server-only"`.
- L'URL de l'API et ses clés sont des variables d'environnement serveur, jamais `NEXT_PUBLIC_*`.
- Tant que l'API n'existe pas, on utilise des données de démonstration côté serveur.
