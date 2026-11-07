# 0023 — Statuts d'événement et sondages en direct

Statut : Proposée
Date : 2026-11-07

## Contexte

Un événement a des contenus (sondage, billetterie, inscriptions, annonce, résultats, programme, plan, photos). Ils doivent être visibles depuis le fil, et un sondage doit se suivre en direct et se voter sans quitter l'écran.

## Décision

- **Tuiles.** Sous l'affiche, à côté de la tuile de date, de petits papiers carrés (icône et mot court) : les deux premiers contenus, puis « +N » qui ouvre au troisième. Un halo marque le premier contenu non vu.
- **Statuts.** Toute tuile ouvre le même écran plein écran, sur le modèle des statuts : une barre de progression par contenu (5 s), en-tête organisateur · événement · date et croix, toucher le premier tiers pour revenir et le reste pour avancer, fermeture après le dernier. Le fond suit la nature du contenu, aux couleurs de la marque (`--brand`) : marque pour ce qui engage (sondage, billets, inscriptions), encre pour ce qui informe (annonce, résultats, photos), marque foncée pour ce qui organise (programme, plan). Un seul bouton d'action en bas, quand le contenu a une destination.
- **Sondage en direct.** Dans une zone dédiée au centre (papier blanc au coin coupé), les options sont des barres verticales épaisses sur une ligne de base commune, l'image ronde et le rang au sommet : un seul ensemble, pas une carte par option. Les votes sont relus toutes les 1,5 s tant que l'onglet est visible, les barres et l'ordre s'animent. On vote en touchant une colonne, et on peut changer d'avis jusqu'à la fermeture ; les pourcentages n'apparaissent qu'après le vote. Un sondage ouvert ne défile pas tout seul ; un sondage à venir montre sa date d'ouverture.
- **Contrat d'API** (à implémenter par le backend, simulé dans `e2e/api-factice`) :
  - `EventView.stories?: EventStory[]`, dans l'ordre des tuiles, avec le sondage joint (`poll`) ;
  - `GET /api/v1/events/{id}/polls/{pollId}` → `Poll`, public ;
  - `PUT /api/v1/events/{id}/polls/{pollId}/vote` `{ optionId }` → `Poll`, compte connecté (on envoie l'option voulue, pas une bascule).
- Voter exige un compte : sans session, on passe par la connexion. Les contenus vus sont retenus sur l'appareil (`localStorage`), simple confort.
- Le code vit dans le module `events` (domaine `event-story.ts`) : les statuts n'existent pas sans leur événement, et un module séparé créerait une dépendance circulaire avec la carte.

Non retenus : défilement automatique sur un sondage ouvert (pas le temps de voter) ; temps réel par WebSocket (la relecture suffit pour la V1) ; page détaillée du sondage (lot suivant).

## Conséquences

- Tant que l'API ne renvoie pas `stories`, aucune tuile n'apparaît.
- La relecture coûte une requête toutes les 1,5 s par statut de sondage ouvert.
