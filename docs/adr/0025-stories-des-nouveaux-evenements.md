# 0025 — Stories des nouveaux événements

Statut : Acceptée
Date : 2026-11-09
Reprend : la barre « En ce moment » retirée (commit 578bea5, ADR 0021)

## Contexte

Un événement qui vient d'être publié doit se remarquer. Comme une story, il apparaît en bulle en tête de l'accueil pendant un temps limité, sans quitter le fil.

## Décision

1. **Durée** : de la création (`createdAt`) jusqu'à deux jours plus tard, ou jusqu'à la fin de l'événement si elle arrive avant (`effectiveEnd`). Un événement passé ou annulé n'a pas de story. Règles dans `domain/stories.ts`.
2. **Lecture filtrée par l'API** : `listStories` demande les événements en cours et à venir créés depuis deux jours (`GET /api/v1/events?createdAfter=…`, branche `feat/stories` du backend), 100 au plus, puis applique la règle complète. Une API qui ignore ce paramètre renvoie plus d'événements, sans changer le résultat.
3. **Zone « Nouveautés »** : une rangée de bulles en tête de l'accueil, sur téléphone comme sur ordinateur, sans titre visible (nommée pour les lecteurs d'écran), le nom de chaque page en gras. **Bulles** : une par page, la page qui a publié le plus récemment d'abord ; dans une bulle, du plus ancien au plus récent. Les bulles vues passent après les autres.
4. **« Vu »** dans le navigateur seulement (`localStorage`, clé `lc:stories-seen`, 300 identifiants au plus), lu avec `useSyncExternalStore`.
5. **Un écran de story est la fiche plein écran elle-même** (`EventStage`) : même affiche, même colonne d'actions, même bas, même panneau d'informations. La story ajoute la progression en haut et remplace la barre du haut par l'en-tête d'une carte du fil (avatar, page, date de publication relative, « Suivre », fermeture à droite) ; la page n'est donc plus répétée dans la colonne d'actions ni en bas, où restent le nom et la description. Elle pose ses zones de toucher sur l'affiche seulement. Elle se met en pause pendant que le panneau est ouvert. 5 s par écran, pause à l'appui, gauche / droite, Échap ; un écran affiché compte comme une vue de l'événement ; ces vues sont envoyées **en une seule action à la fermeture** de la story (`trackEventViewsAction`), ou quand on quitte l'accueil depuis elle, pas une action par écran.
6. **Anneau** : un dégradé unique où domine le bleu du logo (plein sur 55 %), puis vers un violet (`#7C3AED`, `--story-ring`, interpolé en oklab) : couleur voisine du bleu, donc un milieu propre, qui fait le lien avec le fuchsia de l'interface, gris une fois la bulle vue. Le bleu reste un accent de l'emblème, jamais un fond ni un texte.
7. **Astuce de la première story, façon TikTok** : sur un voile sombre, une main (`SwipeHandIcon`) glisse vers le haut en boucle avec sa traînée, et « Glisse vers le haut pour les détails ». La story attend ; le premier toucher la fait disparaître sans changer d'écran, un glissement ouvre directement les détails. Une seule fois par navigateur (`localStorage`, clé `lc:story-hint-seen`) ; animation coupée si le système demande moins de mouvement.
8. **Pas de préchargement** des liens de la fiche plein écran (`prefetch={false}`) : en story, chaque écran déclencherait sinon le rendu des pages liées sans clic.
9. **Le fil ne change pas** : l'événement y reste. Une panne des stories n'empêche pas le fil.

## Conséquences

- Les vues d'une story fermée en quittant l'onglet sont perdues.
- Le « vu » ne suit pas la personne d'un appareil à l'autre.
