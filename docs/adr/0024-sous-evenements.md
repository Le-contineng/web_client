# 0024 — Sous-événements

Statut : Proposée
Date : 2026-11-07

## Contexte

L'API sait regrouper des événements sous un événement principal (ADR 0030 du backend : festival, tournoi, semaine d'intégration). Le site doit les montrer sans saturer le fil, et permettre aux organisateurs de les créer.

## Décision

- **Fil (option C)** : une seule carte pour l'événement principal, qui affiche sous son lieu son **prochain rendez-vous** (quand, puis le nom entier) et remonte quand il approche. Les sous-événements n'ont pas de carte, sauf dans une recherche par mot.
- **Fiche d'un principal** : section « Programme » (les sous-événements du plus tôt au plus tard ; passés et annulés grisés), lue par `GET /api/v1/events/{id}/sub-events`. **Fiche d'un sous-événement** : « Fait partie de [principal] » sous le titre.
- **Espace organisateur** : une ligne de sous-événement porte « Sous-événement de … » ; un principal affiche son nombre de rendez-vous. « Ajouter un sous-événement » (menu d'actions et fiche) ouvre `/studio/{slug}/evenements/nouveau?parent={id}`, qui préremplit le lieu et les catégories du principal et envoie `parentEventId`.
- **Erreurs** : les refus de l'API (`outsideParent`, `subEventsOutside`, `parentNotEditable`…) s'affichent sous le champ concerné.
- **Posts** : le fil des posts d'un principal reçoit aussi ceux de ses sous-événements (`eventId` de chaque post).

## Conséquences

- Pas de rattachement ni de détachement après coup en V1.
- Le nom du sous-événement d'origine d'un post n'est pas encore affiché dans le fil des posts du principal.
