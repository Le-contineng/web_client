# 0006 — Thème sombre

Statut : Reportée
Date : 2026-10-10

## Contexte
shadcn/ui gère nativement un thème sombre via des variables CSS. L'ajouter tard oblige à repasser sur toutes les couleurs.

## Décision
Pas de thème sombre en Sprint 0. En revanche, toutes les couleurs passent par des variables (tokens) définies dans `globals.css`, jamais par des couleurs écrites en dur.

## Alternatives
- Thème sombre dès le départ avec `next-themes` : plus de travail de design et de tests pour un besoin non exprimé.

## Conséquences
- Ajouter le thème sombre plus tard reviendra à définir les tokens `.dark`, sans toucher aux composants.
- À reprendre quand les utilisateurs le demandent ou quand le design system est stabilisé.
