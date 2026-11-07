---
version: 1
slug: "src-app-user-studio-slug-page-tsx"
primary_target: "src/app/(user)/studio/[slug]/page.tsx"
related_targets: []
---

# Espace organisateur — liste des événements (/studio/{slug})

Mode : Operate. Public : membres d'une page (contributeur, propriétaire), sur téléphone entre deux cours, sessions courtes. Tâche : voir où en sont les événements de la page et agir vite (modifier, publier un post, annuler, voir). Lot 1 : structure de l'espace et liste ; tableau de bord au lot 2 ; audience, équipe et page déplacées au lot 3 (liens vers les écrans existants en attendant).

## Direction contract

THESIS: un outil de travail, pas une vitrine : une liste dense par onglets d'état (À venir, En cours, Passés, Annulés), une ligne par événement, actions dans un menu qui monte du bas. Refuse la grille d'affiches façon profil Instagram.

OWN-WORLD: charte Le Contineng, couleur restreinte : fond gris très clair, lignes blanches à filet, encre #0A0A0A, gris texte #3D4350, Space Grotesk 400–600. Fuchsia #DB2777 réservé à « Publier » : rubriques et onglets d'état actifs en encre (retour de l'utilisateur : trop de fuchsia à l'écran) ; la tuile date passe en encre (mois en gris capitales), sinon la liste répéterait le fuchsia à chaque ligne.

STORY: l'organisateur voit d'abord ce qui arrive, avec intéressés, vues et posts par ligne, et agit en deux touchers.

FIRST VIEWPORT: en-tête blanc : sélecteur de page (nom 20px, rôle) à gauche, « Publier » fuchsia à droite ; navigation de l'espace (Événements, Audience, Équipe, Page) ; onglets d'état avec compteurs ; puis 7 à 8 lignes : tuile date, nom, statut, chiffres, bouton « … » de 40px.

FORM: liste dense par onglets, 2e de 7 sur ma liste ; seed:d269017edd29b1b2. Signature : l'événement en cours porte un coin plié fuchsia (pli #A8195C), le seul geste origami de l'écran.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Décisions après relecture

- Fond de l'espace : gris très clair (`--secondary`) en clair, Nuit en sombre ; lignes en feuilles blanches (`--card`).
- Menu d'actions : « Voir les posts » s'ajoute aux quatre actions demandées, car c'est le seul chemin de l'espace vers les posts d'un événement (et leur suppression).
- Les empattements de B, D et E viennent du dessin de Space Grotesk (hérité de Space Mono), pas d'une police de secours.
