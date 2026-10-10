# 0007 — Authentification

Statut : Reportée
Date : 2026-10-10

## Contexte
Un réseau social a besoin de comptes utilisateurs. La connexion influence le rendu (pages personnalisées donc dynamiques), le cache (données privées) et la sécurité.

## Décision
Pas d'authentification en Sprint 0. Elle est prévue pour un sprint ultérieur ; le fournisseur sera choisi dans un nouvel ADR.

## Alternatives
- L'intégrer dès le Sprint 0 : impossible à bien faire sans l'API ni les choix de backend.

## Conséquences
- Les pages restent publiques pour l'instant.
- Les règles posées dès maintenant (Server Actions qui valident leurs entrées, pas de données privées en cache partagé) préparent son arrivée.
- À reprendre dès qu'une fonctionnalité exige de savoir qui est l'utilisateur.
