# 0024 — Sous-événements

Statut : Proposée
Date : 2026-11-07

## Contexte

L'API sait regrouper des événements sous un événement principal (ADR 0030 du backend : festival, tournoi, semaine d'intégration). Le site doit les montrer sans saturer le fil, et permettre aux organisateurs de les créer.

## Décision

- **Fil** : chaque sous-événement a sa carte, à sa date, avec au-dessus du titre un bandeau « [principal] › · 2 sur 3 » qui mène au principal. Le principal garde sa carte, avec « Programme · N rendez-vous » (lien vers son programme) ; l'API évite deux cartes d'une même famille d'affilée. Un sous-événement sans affiche reprend celle de son principal, et, si aucun des deux n'en a, la même photo par défaut (`withInheritedPhoto`, `eventImage`), pour qu'on reconnaisse la famille d'un coup d'œil. Choix révisé : l'option C (une seule carte, « prochain rendez-vous ») cachait les rendez-vous eux-mêmes.
- **Fiche d'un principal** : section « Programme » (les sous-événements du plus tôt au plus tard ; passés et annulés grisés), lue par `GET /api/v1/events/{id}/sub-events`. **Fiche d'un sous-événement** : le même bandeau « [principal] › · 2 sur 3 » sous l'organisateur.
- **Espace organisateur** : une ligne de sous-événement porte « Sous-événement de … » ; un principal affiche son nombre de rendez-vous. « Ajouter un sous-événement » (menu d'actions et fiche) ouvre `/studio/{slug}/evenements/nouveau?parent={id}`, qui préremplit le lieu et les catégories du principal et envoie `parentEventId`.
- **Erreurs** : les refus de l'API (`outsideParent`, `subEventsOutside`, `parentNotEditable`…) s'affichent sous le champ concerné.
- **Posts** : le fil des posts d'un principal reçoit aussi ceux de ses sous-événements (`eventId` de chaque post).

## Conséquences

- Pas de rattachement ni de détachement après coup en V1.
- Le nom du sous-événement d'origine d'un post n'est pas encore affiché dans le fil des posts du principal.
