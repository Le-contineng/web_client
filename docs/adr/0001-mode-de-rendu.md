# 0001 — Mode de rendu

Statut : Acceptée
Date : 2026-10-10

## Contexte
Next.js peut produire les pages en statique, sur le serveur, ou les deux.
Un export 100 % statique interdit les Server Actions, les en-têtes dynamiques et le cache incrémental.

## Décision
Rendu hybride sur un serveur Node : statique par défaut, dynamique quand une page en a besoin.

## Alternatives
- Tout statique : plus simple, mais bloque des fonctions utiles à un réseau social (fils personnalisés, actions).

## Conséquences
- Il faut un hébergeur qui exécute du Node (Vercel le fait).
- Chaque page dynamique doit l'être pour une raison.
