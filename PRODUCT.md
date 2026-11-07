# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Site installable (PWA), sans application native ; utilisé d'abord sur téléphone.

## Users

- **Étudiants et personnel** d'une école (Cameroun, fuseau `Africa/Douala`) : la plupart consultent sans compte, sur téléphone, souvent avec une connexion lente. Leur besoin : savoir ce qui se passe et ce qui arrive.
- **Organisateurs** : membres des clubs, associations, BDE et services de l'école, qui publient au nom d'une page (contributeur ou propriétaire). Ils gèrent **sur téléphone, entre deux cours**, par sessions courtes : publier un événement, corriger une heure ou un lieu, poster une photo pendant l'événement.
- **Équipe Le Contineng** : administration et modération (espace Super-Admin).

## Product Purpose

Le réseau social des événements d'une école : un endroit unique pour découvrir les événements, et pour les organisateurs, un moyen simple de publier, d'être vus et de mesurer l'intérêt. Réussite : des événements publiés chaque semaine, des pages actives, plus de monde aux événements.

## Positioning

Face aux groupes WhatsApp et à Instagram, pour un organisateur :

- **être vu de toute l'école**, sans que les étudiants doivent rejoindre un groupe ;
- **mesurer l'intérêt** : intéressés, vues, abonnés ;
- **annoncer les changements** : un changement de lieu, d'heure ou une annulation prévient automatiquement les intéressés.

## Operating Context

- Seules les pages publient, jamais les comptes individuels. Rôles d'une page : contributeur (publier, modifier, annuler, voir les statistiques) et propriétaire (+ modifier la page, gérer les membres).
- Un compte peut être membre de plusieurs pages.
- Un événement passé ou annulé ne se modifie plus ; on ne publie pas de post dessus.
- Posts d'un événement : carrousel d'images et légende, sans modification en V1.
- Interface en français et en anglais.

## Capabilities and Constraints

- Hors périmètre : messagerie, commentaires, billetterie et paiement, plusieurs écoles, publicité payante (une mise en avant payante sera toujours marquée « Sponsorisé »).
- Hébergement gratuit au démarrage ; le site n'appelle l'API que côté serveur.
- Volume : une école, quelques centaines d'événements actifs.

## Brand Commitments

Charte graphique de novembre 2026 (`~/Downloads/Le-Contineng-Charte-graphique.pptx`) : nom « Le Contineng », logotype « Le Conti » + « neng » en fuchsia, pictogramme et emblème origami fournis en SVG (`public/brand/`). Ton : court, direct, enthousiaste ; dates en toutes lettres.

## Evidence on Hand

Données de démonstration seulement (comptes, pages BDE, Club Foot, Les Planches, Scolarité, événements et posts de démo). Aucun témoignage, chiffre d'usage réel ni client à citer.

## Product Principles

1. Téléphone et connexion lente d'abord.
2. Publier doit être simple et rapide, pour un organisateur qui a deux minutes.
3. Chaque chiffre montré à un organisateur doit l'aider à décider quoi faire.
4. Confiance : pas de spam, données personnelles protégées, ce qui est sponsorisé est marqué.

## Accessibility & Inclusion

WCAG 2.1 A et AA, vérifiée automatiquement (axe) ; les graphiques ont un équivalent lisible par les lecteurs d'écran.
