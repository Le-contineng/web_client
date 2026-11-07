# 0023 — Posts d'un événement

Statut : Proposée
Date : 2026-11-07

## Contexte

Les organisateurs veulent partager la vie d'un événement (photos, informations du jour) au-delà de sa fiche. Une première piste (statuts plein écran, sondage vertical en direct) a été explorée puis écartée pour la V1 ; elle reste dans l'historique de la branche (`b1061bd`).

## Décision

- **EventPost** : un carrousel d'images (au moins une, dans un ordre défini) et une légende facultative, publié par la page organisatrice. Les posts n'expirent pas. En V1, on les consulte seulement : ni flammes, ni commentaires.
- **Fil de l'événement** : une page dédiée, `/e/{id}/posts`, accessible sans compte, qui montre les posts du plus récent au plus ancien, chacun avec son carrousel (défilement aimanté au toucher, flèches sur ordinateur, compteur et points) et sa légende.
- **Tuile « Posts »** : un petit papier générique (icône et mot, sans miniature) posé à côté de la tuile de date, avec le nombre de posts. Tant qu'un post a été publié depuis la dernière visite du fil sur l'appareil, la tuile passe aux couleurs de la marque et s'anime (halo et léger balancement, seulement si le système accepte les animations). La dernière visite est retenue en `localStorage`, simple confort.
- **Modèle du backend** (à implémenter) :

  ```
  EventPost       id, eventId (cascade), caption?, status DRAFT|PUBLISHED,
                  authorId, publishedAt, createdAt, updatedAt
  EventPostImage  id, postId (cascade), position, storageKey,
                  width, height, placeholder (ThumbHash), alt?
  ```

  Les images passent par le circuit du module `medias` (compression dans le navigateur, envoi direct au stockage). Le sondage sera, plus tard, un agrégat `Poll` attaché à un post (composition, pas héritage).

- **Contrat d'API** (simulé dans `e2e/api-factice`) :
  - `EventView.posts?: { count, latestAt }`, pour la tuile ;
  - `GET /api/v1/events/{id}/posts?cursor=…` → `{ posts: EventPost[], nextCursor }`, public, paginé ;
  - publication et modification par les membres de la page : `POST/PUT/DELETE /api/v1/pages/{pageId}/events/{id}/posts[/{postId}]` (lot suivant côté front).

## Conséquences

- Tant que l'API ne renvoie pas `posts`, la tuile n'apparaît pas et le fil est vide.
- Défis côté backend : fichiers orphelins (envoi avant création du post), déclinaisons et suppression des métadonnées EXIF, suppression des fichiers avec le post, modération par le Super-Admin.
