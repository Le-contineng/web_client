# 0005 — Langue unique

Statut : Acceptée
Date : 2026-10-10

## Contexte
Ajouter plusieurs langues après coup oblige à déplacer toutes les routes sous un segment `[locale]`, ce qui est une migration pénible.
Le public visé au lancement est francophone.

## Décision
Le site est en français uniquement. Pas de bibliothèque d'internationalisation en Sprint 0.

## Alternatives
- `next-intl` dès le Sprint 0 : prépare le multilingue, mais ajoute de la complexité à chaque page sans besoin actuel.

## Conséquences
- Les textes sont écrits directement dans les composants.
- `<html lang="fr">` dans le layout racine.
- À revoir si un public non francophone devient une cible : il faudra alors un nouvel ADR et une migration des routes.
