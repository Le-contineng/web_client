# 0025 — Stories des nouveaux événements

Statut : Acceptée
Date : 2026-11-09
Reprend : la barre « En ce moment » retirée (commit 578bea5, ADR 0021)

## Contexte

Un événement qui vient d'être publié doit se remarquer. Comme une story, il apparaît en bulle en tête de l'accueil pendant un temps limité, sans quitter le fil.

## Décision

1. **Durée** : de la création (`createdAt`) jusqu'à deux jours plus tard, ou jusqu'à la fin de l'événement si elle arrive avant (`effectiveEnd`). Un événement passé ou annulé n'a pas de story. Règles dans `domain/stories.ts`.
2. **Pas de lecture dédiée dans l'API pour l'instant** : `listStories` lit les 100 premiers événements en cours et à venir et garde ceux qui sont en story. Une route de l'API remplacera ce filtrage le jour où le volume l'exige.
3. **Zone « Nouveautés »** : une rangée de bulles en tête de l'accueil, sur téléphone comme sur ordinateur. **Bulles** : une par page, la page qui a publié le plus récemment d'abord ; dans une bulle, du plus ancien au plus récent. Les bulles vues passent après les autres.
4. **« Vu »** dans le navigateur seulement (`localStorage`, clé `lc:stories-seen`, 300 identifiants au plus), lu avec `useSyncExternalStore`.
5. **Un écran de story est la fiche plein écran elle-même** (`EventStage`) : même affiche, même colonne d'actions, même bas, même panneau d'informations. La story ajoute la progression en haut et remplace la barre du haut par l'en-tête d'une carte du fil (avatar, page, date de publication relative, « Suivre », fermeture à droite) ; la page n'est donc plus répétée dans la colonne d'actions ni en bas, où restent le nom et la description. Elle pose ses zones de toucher sur l'affiche seulement. Elle se met en pause pendant que le panneau est ouvert. 5 s par écran, pause à l'appui, gauche / droite, Échap ; un écran affiché compte comme une vue de l'événement.
6. **Anneau** : un dégradé unique où domine le bleu du logo (plein sur 55 %), puis vers un violet (`#7C3AED`, `--story-ring`, interpolé en oklab) : couleur voisine du bleu, donc un milieu propre, qui fait le lien avec le fuchsia de l'interface, gris une fois la bulle vue. Le bleu reste un accent de l'emblème, jamais un fond ni un texte.
7. **Le fil ne change pas** : l'événement y reste. Une panne des stories n'empêche pas le fil.

## Conséquences

- Au-delà de 100 événements en cours et à venir, un nouvel événement lointain peut manquer aux stories.
- Le « vu » ne suit pas la personne d'un appareil à l'autre.
